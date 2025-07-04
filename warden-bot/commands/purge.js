const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete a number of messages')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (max 100)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF4444')
        .setTitle('❌ Invalid Amount')
        .setDescription('Please choose a number between **1** and **100**.');

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const deletedMessages = await interaction.channel.bulkDelete(amount, true);

    const resultEmbed = new EmbedBuilder()
      .setColor('#2EE4D9')
      .setTitle('🧹 Messages Deleted')
      .setDescription(`Successfully deleted **${deletedMessages.size}** messages.`)
      .setFooter({
        text: 'Warden Bot',
        iconURL: interaction.client.user.displayAvatarURL()
      });

    await interaction.reply({ embeds: [resultEmbed], ephemeral: true });
  }
};
