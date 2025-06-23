// Import required packages
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config();

// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});

// Optional: Express server for Render FREE Web Service
const app = express();
app.get('/', (req, res) => {
    res.send('Bot is alive!');
});
app.listen(process.env.PORT || 3000, () => {
    console.log(`Express server running on port ${process.env.PORT || 3000}`);
});

// Command listings
const commandLists = {
  all: [
    '',
    '+--------------------------------------+',
    '| General Commands:                    |',
    '+--------------------------------------+',
    '| List All Commands:     |     .cd     |',
    '| YouTube:               |     .yt     |',
    '+--------------------------------------+',
    '', // spacing
    '+--------------------------------------+',
    '| Grand Theft Auto 5 Commands:         |',
    '+--------------------------------------+',
    '| All GTA5 Commands:     |   .cd-gta   |',
    '| Street Dealers:        |   .gta-sd   |',
    '+--------------------------------------+',
    '', // spacing
    '+--------------------------------------+',
    '| Solo Leveling: Arise Commands:       |',
    '+--------------------------------------+',
    '| All SLA Commands:      |   .cd-sla   |',
    '| Supporter Codes:       |   .sla-c    |',
    '| Web Shop:              |   .sla-s    |',
    '+--------------------------------------+',
    '', // spacing
    '+--------------------------------------+',
    '| Pokemon GO Commands:                 |',
    '+--------------------------------------+',
    '| Pokemon GO Commands:   |   .cd-pg    |',
    '| News:                  |   .pg-n     |',
    '| CP Calculator:         |   .pg-cp    |',
    '| Database:              |   .pg-db    |',
    '+--------------------------------------+'
  ],
  gta: [
    '',
    '+--------------------------------------+',
    '| Grand Theft Auto 5 Commands:         |',
    '+--------------------------------------+',
    '| All GTA5 Commands:     |   .cd-gta   |',
    '| Street Dealers:        |   .gta-sd   |',
    '+--------------------------------------+'
  ],
  sla: [
    '',
    '+--------------------------------------+',
    '| Solo Leveling: Arise Commands:       |',
    '+--------------------------------------+',
    '| All SLA Commands:      |   .cd-sla   |',
    '| Supporter Codes:       |   .sla-c    |',
    '| Web Shop:              |   .sla-s    |',
    '+--------------------------------------+'
  ],
  pg: [
    '',
    '+--------------------------------------+',
    '| Pokemon GO Commands:                 |',
    '+--------------------------------------+',
    '| Pokemon GO Commands:   |   .cd-pg    |',
    '| News:                  |   .pg-n     |',
    '| CP Calculator:         |   .pg-cp    |',
    '| Database:              |   .pg-db    |',
    '+--------------------------------------+'
  ]
};

// Event: When bot is ready
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
});

// Event: When a message is received
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Command listing handlers
    if (message.content === '.cd') {
        await message.channel.send('```' + commandLists.all.join('\n') + '```');
        return;
    } else if (message.content === '.cd-gta') {
        await message.channel.send('```' + commandLists.gta.join('\n') + '```');
        return;
    } else if (message.content === '.cd-sla') {
        await message.channel.send('```' + commandLists.sla.join('\n') + '```');
        return;
    } else if (message.content === '.cd-pg') {
        await message.channel.send('```' + commandLists.pg.join('\n') + '```');
        return;
    }

    // General links
    if (message.content === '.yt') {
        await message.channel.send('👉 https://www.youtube.com/');
    }

    // GTA5 links
    if (message.content === '.gta-sd') {
        await message.channel.send('👉 https://gtalens.com/map/street-dealers');
    }

    // Solo Leveling links
    if (message.content === '.sla-c') {
        await message.channel.send('👉 https://creator.netmarble.com/en');
    } else if (message.content === '.sla-s') {
        await message.channel.send('👉 https://slvshop.netmarble.com/en/event/daily_gift');
    }

    // Pokemon GO links
    if (message.content === '.pg-n') {
        await message.channel.send('👉 https://leekduck.com/events/');
    } else if (message.content === '.pg-cp') {
        await message.channel.send('👉 https://pokemon.gameinfo.io/en/tools/evolution-calculator');
    } else if (message.content === '.pg-db') {
        await message.channel.send('👉 https://db.pokemongohub.net');
    }
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);
