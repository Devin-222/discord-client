const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randnum')
    .setDescription('Generate random number(s) between two values')
    .addIntegerOption(option =>
      option.setName('min')
        .setDescription('Minimum number')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('max')
        .setDescription('Maximum number')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('How many numbers to generate (1–10)')
        .setRequired(false)),

  async execute(interaction) {
    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');
    const amount = interaction.options.getInteger('amount') || 1;

    if (min >= max) {
      return interaction.reply({
        content: '❌ Min must be less than Max.',
        ephemeral: true
      });
    }

    if (amount < 1 || amount > 10) {
      return interaction.reply({
        content: '❌ You can generate between 1 and 10 numbers.',
        ephemeral: true
      });
    }

    const results = Array.from({ length: amount }, () =>
      Math.floor(Math.random() * (max - min + 1)) + min
    );

    const embed = new EmbedBuilder()
      .setColor('#2EE4D9')
      .setTitle('🎲 Random Number Generator')
      .addFields(
        { name: 'Range', value: `**${min}** to **${max}**`, inline: true },
        { name: 'Quantity', value: `${amount}`, inline: true },
        { name: 'Result', value: results.join(', ') }
      )
      .setFooter({
        text: 'Warden Bot',
        iconURL: interaction.client.user.displayAvatarURL()
      });

    await interaction.reply({ embeds: [embed] });
  }
};
