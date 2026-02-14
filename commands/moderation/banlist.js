const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banlist')
        .setDescription('Yasaklı kullanıcıları listeler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const bans = await interaction.guild.bans.fetch();
            if (bans.size === 0) {
                return interaction.editReply({ content: 'Bu sunucuda yasaklı kullanıcı yok.' });
            }

            const bannedUsers = bans.map(ban => `**${ban.user.tag}** (${ban.user.id}) - ${ban.reason || 'Sebep yok'}`).slice(0, 20); // Limit to top 20 to avoid max length

            const embed = new EmbedBuilder()
                .setColor(client.config.styling.embedColor)
                .setTitle(`⛔ Yasaklı Kullanıcılar (${bans.size})`)
                .setDescription(bannedUsers.join('\n') + (bans.size > 20 ? `\n\n...ve ${bans.size - 20} kişi daha.` : ''))
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Yasaklı listesi alınırken bir hata oluştu.' });
        }
    },
};
