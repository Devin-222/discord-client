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

// Event: When bot is ready
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
});

// Event: When a message is received
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '.cd') {
        const commands = [
            'YouTube - .yt',
            'GTA5 Street Dealers - .gta-sd',
            'Solo Leveling: Arise Supporter Codes - .sla-c',
            'Solo Leveling: Arise Supporter Shop - .sla-s',
            'Pokemon GO News - .pg-n',
            'Pokemon GO CP Calculator - .pg-cp',
            'Pokemon GO Database - .pg-db',
            'List All Commands - .cd'
        ];
        await message.channel.send('📜 **Available commands:**\n' + commands.join('\n'));
        return;
    }

    // General links
    if (message.content === '.yt') {
        await message.channel.send('👉 https://www.youtube.com/');
    } else if (message.content === '.gta-sd') {
        await message.channel.send('👉 https://gtalens.com/map/street-dealers');
    } else if (message.content === '.sla-c') {
        await message.channel.send('👉 https://creator.netmarble.com/en');
    } else if (message.content === '.sla-s') {
        await message.channel.send('👉 https://slvshop.netmarble.com/en/event/daily_gift');
    } else if (message.content === '.pg-n') {
        await message.channel.send('👉 https://leekduck.com/events/');
    } else if (message.content === '.pg-cp') {
        await message.channel.send('👉 https://pokemon.gameinfo.io/en/tools/evolution-calculator');
    } else if (message.content === '.pg-db') {
        await message.channel.send('👉 https://db.pokemongohub.net');
    }
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);
