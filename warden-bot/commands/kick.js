const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kicking'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF4444')
        .setTitle('❌ User Not Found')
        .setDescription('Make sure the user is still in the server.');

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    await member.kick(reason);

    const kickEmbed = new EmbedBuilder()
      .setColor('#2EE4D9')
      .setTitle('👢 User Kicked')
      .addFields(
        { name: 'User', value: user.tag, inline: true },
        { name: 'Reason', value: reason, inline: true }
      )
      .setFooter({
        text: 'Warden Bot',
        iconURL: interaction.client.user.displayAvatarURL()
      });

    await interaction.reply({ embeds: [kickEmbed] });
  }
};
