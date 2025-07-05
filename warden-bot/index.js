const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const fs = require('fs');

// Create client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Load slash commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Ready event
client.once(Events.ClientReady, () => {
    console.log(`✅ Warden is online as ${client.user.tag}`);
});

// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Error in command ${interaction.commandName}:`, error);

        const errorEmbed = new EmbedBuilder()
            .setColor('#FF4444')
            .setTitle('⚠️ Command Error')
            .setDescription('Something went wrong while executing this command.')
            .setFooter({
                text: 'Warden Bot',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

// Log in
client.login(process.env.TOKEN);

// --- Express server to keep bot alive on Replit/Render ---
const express = require('express');
const app = express();

app.get('/', (_, res) => res.send('🟢 Warden is alive!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Keep-alive server running on port ${PORT}`));
