const path = require('path');
const Database = require('better-sqlite3');

// Use /data for Render deployment, else local file during development
const dbPath = process.env.RENDER ? '/data/availability.db' : path.join(__dirname, 'availability.db');
const db = new Database(dbPath);

// Create table if it doesn't exist yet
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
    const row = db.prepare('SELECT time FROM availability WHERE user_id = ? AND day = ?').get(userId, day);
    return row?.time ?? DEFAULT_TIME; // Return DEFAULT_TIME if not set
  },

  getAllForDay(day) {
    return db.prepare('SELECT user_id, time FROM availability WHERE day = ?').all(day);
  },

  ensureUserDefaults(userId) {
    // Check which days are already set for the user
    const existingDays = db.prepare('SELECT day FROM availability WHERE user_id = ?').all(userId).map(r => r.day);

    const insert = db.prepare(`
      INSERT OR IGNORE INTO availability (user_id, day, time)
      VALUES (?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      for (const day of DAYS) {
        if (!existingDays.includes(day)) {
          insert.run(userId, day, DEFAULT_TIME);
        }
      }
    });

    transaction();
  }
};
