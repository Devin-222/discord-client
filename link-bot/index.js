// Import required packages
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});

// Event: When bot is ready
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
});

// Event: When a message is received
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // General links
    if (message.content === '.yt') {
        await message.channel.send('👉 https://www.youtube.com/');
    } else if (message.content === '.go') {
        await message.channel.send('👉 https://www.google.com/');
    }

    // GTA 5 links
    if (message.content === '.gta-sd') {
        await message.channel.send('👉 https://gtalens.com/map/street-dealers');
    }

    // Solo Leveling: Arise links
    if (message.content === '.sla-c') {
        await message.channel.send('👉 https://creator.netmarble.com/en');
    } else if (message.content === '.sla-s') {
        await message.channel.send('👉 https://slvshop.netmarble.com/en/event/daily_gift');
    }

    // Pokemon GO links
    if (message.content === '.pg-news') {
        await message.channel.send('👉 https://leekduck.com/events/');
    } else if (message.content === '.pg-cp') {
        await message.channel.send('👉 https://pokemon.gameinfo.io/en/tools/evolution-calculator');
    } else if (message.content === '.pg-db') {
        await message.channel.send('👉 https://db.pokemongohub.net');
    }
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);
