const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temizle')
        .setDescription('Belirtilen miktarda mesajı siler.')
        .addIntegerOption(option =>
            option.setName('miktar')
                .setDescription('Silinecek mesaj sayısı (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction, client) {
        const amount = interaction.options.getInteger('miktar');

        await interaction.channel.bulkDelete(amount, true).then(messages => {
            const embed = new EmbedBuilder()
                .setColor(client.config.styling.successColor)
                .setDescription(`✅ Başarıyla **${messages.size}** mesaj temizlendi.`)
                .setTimestamp();

            interaction.reply({ embeds: [embed], ephemeral: true });
        }).catch(err => {
            interaction.reply({ content: 'Mesajlar 14 günden eski olduğu için silinemedi.', ephemeral: true });
        });
    },
};
