require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require('discord.js');
const db = require('./db');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const TIME_OPTIONS = [
  "Anytime",
  "Not available",
  "12am",
  "11:30pm",
  "11pm",
  "10:30pm",
  "10pm",
  "9:30pm",
  "9pm",
  "8:30pm",
  "8pm",
  "7:30pm",
  "7pm",
  "6:30pm",
  "6pm"
];
const tempResults = {};

const ORANGE = 0xFFA500;

const commands = [
  new SlashCommandBuilder()
    .setName('avail')
    .setDescription('Set your availability for the week or a single day')
    .addStringOption(opt =>
      opt.setName('day')
        .setDescription('Update only one day (optional)')
        .addChoices(...DAYS.map(d => ({ name: d.toUpperCase(), value: d })))
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('sch')
    .setDescription('View availability for everyone or a specific user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to check (optional)')
        .setRequired(false)
    )
];

// Register slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('🔁 Registering slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Slash commands registered.');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
}

// Interaction handler
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === 'avail') {
      const userId = interaction.user.id;
      const day = interaction.options.getString('day'); // optional day filter

      await db.ensureUserDefaults(userId);

      tempResults[userId] = {};

      if (day) {
        // Single day update flow
        tempResults[userId][day] = null; // placeholder
        await interaction.reply({ embeds: [
          new EmbedBuilder()
            .setTitle(`Update availability for ${day.toUpperCase()}`)
            .setColor(ORANGE)
            .setDescription(`Please select your availability for **${day.toUpperCase()}**`)
        ], components: [
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`availability_${userId}_${DAYS.indexOf(day)}`)
              .setPlaceholder(`Select availability for ${day}`)
              .addOptions(TIME_OPTIONS.map(time => ({ label: time, value: time })))
          )
        ], ephemeral: true });
      } else {
        // Full week update flow
        await interaction.reply({ embeds: [
          new EmbedBuilder()
            .setTitle('Set your availability for the week')
            .setColor(ORANGE)
            .setDescription('Let’s start with Monday.')
        ], ephemeral: true });

        sendDayMenu(interaction, userId, 0);
      }
    }

    else if (commandName === 'sch') {
      const user = interaction.options.getUser('user');

      if (user) {
        // Show single user's full week
        const avail = {};
        for (const day of DAYS) {
          avail[day] = db.getUserDay(user.id, day);
        }

        const embed = new EmbedBuilder()
          .setTitle(`${user.username}'s Availability`)
          .setColor(ORANGE)
          .setDescription(DAYS.map(day => `**${day.toUpperCase()}**: ${avail[day]}`).join('\n'));

        await interaction.reply({ embeds: [embed] });
      } else {
        // Show everyone for full week
        const userMap = new Map();

        for (const day of DAYS) {
          const entries = db.getAllForDay(day);
          for (const { user_id, time } of entries) {
            if (!userMap.has(user_id)) userMap.set(user_id, {});
            userMap.get(user_id)[day] = time;
          }
        }

        if (userMap.size === 0) {
          return interaction.reply('No availability data set yet.');
        }

        const embed = new EmbedBuilder()
          .setTitle('All Users Availability')
          .setColor(ORANGE);

        const userIds = Array.from(userMap.keys());
        const users = await Promise.all(userIds.map(uid => client.users.fetch(uid).catch(() => null)));

        for (let i = 0; i < userIds.length; i++) {
          const uid = userIds[i];
          const userAvail = userMap.get(uid);
          const username = users[i]?.username ?? `Unknown (${uid})`;
          const weekText = DAYS.map(day => `**${day.toUpperCase()}**: ${userAvail[day] ?? 'Not set'}`).join('\n');

          embed.addFields({ name: username, value: weekText });
        }

        await interaction.reply({ embeds: [embed] });
      }
    }
  }

  else if (interaction.isStringSelectMenu()) {
    const [prefix, userId, dayIndexStr] = interaction.customId.split('_');
    if (prefix !== 'availability' || interaction.user.id !== userId) {
      return interaction.reply({ content: 'Not authorized for this menu.', ephemeral: true });
    }

    const dayIndex = Number(dayIndexStr);
    const selectedTime = interaction.values[0];

    if (!tempResults[userId]) tempResults[userId] = {};
    tempResults[userId][DAYS[dayIndex]] = selectedTime;

    await interaction.deferUpdate();

    // Detect if updating single day (only one day in tempResults) or full week
    const updatingSingleDay = Object.keys(tempResults[userId]).length === 1 && dayIndex < DAYS.length;

    if (updatingSingleDay || dayIndex + 1 >= DAYS.length) {
      // Save all gathered data so far
      db.saveUserAvailability(userId, tempResults[userId]);

      const summary = Object.entries(tempResults[userId])
        .map(([day, time]) => `**${day.toUpperCase()}**: ${time}`)
        .join('\n');

      delete tempResults[userId];

      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setTitle('Availability saved!')
          .setColor(ORANGE)
          .setDescription(summary)
        ],
        components: []
      });
    } else {
      // Continue to next day
      sendDayMenu(interaction, userId, dayIndex + 1);
    }
  }
});

async function sendDayMenu(interaction, userId, dayIndex) {
  if (dayIndex >= DAYS.length) return;

  const currentDay = DAYS[dayIndex];
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`availability_${userId}_${dayIndex}`)
    .setPlaceholder(`Select availability for ${currentDay}`)
    .addOptions(TIME_OPTIONS.map(time => ({ label: time, value: time })));

  const row = new ActionRowBuilder().addComponents(menu);

  await interaction.editReply({
    content: null,
    embeds: [
      new EmbedBuilder()
        .setTitle(`Select availability for ${currentDay.toUpperCase()}`)
        .setColor(ORANGE)
    ],
    components: [row],
  });
}

client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  registerCommands();
});

client.login(TOKEN);
