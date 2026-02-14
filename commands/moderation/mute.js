const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Bir kullanıcıyı belirli bir süre susturur (Timeout).')
        .addUserOption(option => option.setName('kullanici').setDescription('Susturulacak kullanıcı').setRequired(true))
        .addIntegerOption(option =>
            option.setName('sure')
                .setDescription('Süre (Dakika cinsinden)')
                .setRequired(true))
        .addStringOption(option => option.setName('sebep').setDescription('Susturma sebebi').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('kullanici');
        const duration = interaction.options.getInteger('sure');
        const reason = interaction.options.getString('sebep') || 'Belirtilmedi';

        const member = await interaction.guild.members.fetch(user.id);

        try {
            await member.timeout(duration * 60 * 1000, reason);

            const embed = new EmbedBuilder()
                .setColor('#f1c40f') // Yellow
                .setTitle('🔇 Kullanıcı Susturuldu')
                .addFields(
                    { name: 'Kullanıcı', value: `${user.tag} (${user.id})` },
                    { name: 'Süre', value: `${duration} Dakika` },
                    { name: 'Sebep', value: reason },
                    { name: 'Yetkili', value: interaction.user.tag }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Kullanıcı susturulurken bir hata oluştu veya yetkim yetmiyor!', ephemeral: true });
        }
    },
};
