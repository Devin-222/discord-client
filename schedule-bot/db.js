const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Determine storage location (support Render deployment)
const isRender = !!process.env.RENDER;
const dbDir = isRender ? path.join(__dirname, 'data') : __dirname;

// Ensure the database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Define DB path and connect
const dbPath = path.join(dbDir, 'availability.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS availability (
    user_id TEXT NOT NULL,
    day TEXT NOT NULL,
    time TEXT,
    PRIMARY KEY (user_id, day)
  )
`).run();

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DEFAULT_TIME = "Anytime";

module.exports = {
  saveUserAvailability(userId, dayTimeMap) {
    const insert = db.prepare(`
      INSERT INTO availability (user_id, day, time)
      VALUES (@user_id, @day, @time)
      ON CONFLICT(user_id, day) DO UPDATE SET time = excluded.time
    `);

    const transaction = db.transaction(entries => {
      for (const [day, time] of Object.entries(entries)) {
        insert.run({ user_id: userId, day, time });
      }
    });

    transaction(dayTimeMap);
  },

  getUserDay(userId, day) {
    const row = db.prepare(`
      SELECT time FROM availability
      WHERE user_id = ? AND day = ?
    `).get(userId, day);
    return row?.time ?? DEFAULT_TIME;
  },

  getAllForDay(day) {
    return db.prepare(`
      SELECT user_id, time FROM availability
      WHERE day = ?
    `).all(day);
  },

  ensureUserDefaults(userId) {
    const existing = db.prepare(`
      SELECT day FROM availability
      WHERE user_id = ?
    `).all(userId).map(r => r.day);

    const insert = db.prepare(`
      INSERT OR IGNORE INTO availability (user_id, day, time)
      VALUES (?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      for (const day of DAYS) {
        if (!existing.includes(day)) {
          insert.run(userId, day, DEFAULT_TIME);
        }
      }
    });

    transaction();
  }
};
