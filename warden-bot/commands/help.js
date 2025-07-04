const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show a list of available commands'),

  async execute(interaction) {
    const member = interaction.member;

    const allCommands = [
      {
        name: '/ban',
        description: 'Ban a user from the server',
        permission: PermissionFlagsBits.BanMembers
      },
      {
        name: '/kick',
        description: 'Kick a user from the server',
        permission: PermissionFlagsBits.KickMembers
      },
      {
        name: '/purge',
        description: 'Delete a number of recent messages',
        permission: PermissionFlagsBits.ManageMessages
      },
      {
        name: '/help',
        description: 'Show this help message',
        permission: null
      }
    ];

    const availableFields = allCommands
      .filter(cmd => !cmd.permission || member.permissions.has(cmd.permission))
      .map(cmd => ({
        name: cmd.name,
        value: cmd.description,
        inline: false
      }));

    const helpEmbed = new EmbedBuilder()
      .setColor('#2EE4D9')
      .setTitle('📋 Available Commands')
      .setDescription('Here are the commands you can use:')
      .addFields(availableFields)
      .setFooter({
        text: 'Warden Bot',
        iconURL: interaction.client.user.displayAvatarURL()
      });

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  }
};
