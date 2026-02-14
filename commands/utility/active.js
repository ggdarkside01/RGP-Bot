const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aktif')
        .setDescription('Sunucunun aktif olduğunu duyurur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('🟢 SUNUCU AKTİF')
            .setDescription('**RGP Shop** sunucusu şu anda aktiftir! Giriş yapabilir, maceraya devam edebilirsiniz.\n\n🎮 **İyi Oyunlar Dileriz!**')
            .setImage('https://i.imgur.com/uN8mE32.png') // Placeholder for a cool RP banner
            .setTimestamp()
            .setFooter({ text: 'Vortex Bot Sunucu Durumu' });

        await interaction.channel.send({ content: '@everyone', embeds: [embed] });
        await interaction.reply({ content: 'Aktif duyurusu yapıldı!', flags: [MessageFlags.Ephemeral] });
    },
};
