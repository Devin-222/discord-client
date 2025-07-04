const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
require('dotenv').config();
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands');
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
    console.log(`✅ Warden is online as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
