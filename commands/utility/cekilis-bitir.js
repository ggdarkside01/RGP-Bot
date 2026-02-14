const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cekilis-bitir')
        .setDescription('Devam eden bir çekilişi erken sonlandırır.')
        .addStringOption(option => option.setName('mesaj_id').setDescription('Sonlandırılacak çekilişin mesaj ID\'si').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
    async execute(interaction, client) {
        const messageId = interaction.options.getString('mesaj_id');
        const giveaway = client.activeGiveaways.get(messageId);

        if (!giveaway) {
            return interaction.reply({ content: 'Bu ID ile aktif bir çekiliş bulunamadı! Lütfen doğru mesaj ID\'sini girdiğinizden emin olun.', ephemeral: true });
        }

        await interaction.reply({ content: 'Çekiliş erken sonlandırılıyor...', ephemeral: true });

        // Clear the original timeout
        clearTimeout(giveaway.timeout);

        // Log early end
        const logChannel = client.channels.cache.get(client.config.logChannelId);
        if (logChannel) {
            const endLog = new EmbedBuilder()
                .setColor('#e67e22')
                .setTitle('📢 Çekiliş Erken Sonlandırıldı')
                .addFields(
                    { name: 'Mesaj ID', value: messageId, inline: true },
                    { name: 'Sonlandıran', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();
            logChannel.send({ embeds: [endLog] }).catch(() => { });
        }

        // Trigger the winner selection logic
        await giveaway.selectWinners();

        // Final response
        await interaction.editReply({ content: 'Çekiliş başarıyla sonlandırıldı.' });
    },
};
