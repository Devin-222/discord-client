const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show a list of available commands'),

  async execute(interaction) {
    const member = interaction.member;

    const availableCommands = interaction.client.commands
      .filter(cmd => {
        const perms = cmd.data.default_member_permissions;
        return !perms || member.permissions.has(PermissionFlagsBits[perms]);
      })
      .map(cmd => ({
        name: `/${cmd.data.name}`,
        value: cmd.data.description || 'No description provided.',
      }));

    const embed = new EmbedBuilder()
      .setColor('#2EE4D9')
      .setTitle('📋 Available Commands')
      .setDescription('Here are the commands you can use:')
      .addFields(availableCommands)
      .setFooter({
        text: 'Warden Bot',
        iconURL: interaction.client.user.displayAvatarURL()
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
