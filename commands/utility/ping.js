const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun gecikme süresini ölçer.'),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor(client.config.styling.embedColor)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Gecikme', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true },
                { name: 'API Gecikmesi', value: `${Math.round(client.ws.ping)}ms`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
