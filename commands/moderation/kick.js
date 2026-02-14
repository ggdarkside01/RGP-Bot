const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Bir kullanıcıyı sunucudan atar.')
        .addUserOption(option => option.setName('kullanici').setDescription('Atılacak kullanıcı').setRequired(true))
        .addStringOption(option => option.setName('sebep').setDescription('Atılma sebebi').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('kullanici');
        const reason = interaction.options.getString('sebep') || 'Belirtilmedi';

        const member = await interaction.guild.members.fetch(user.id);
        if (!member.kickable) {
            return interaction.reply({ content: 'Bu kullanıcıyı atmak için yetkim yetmiyor!', ephemeral: true });
        }

        await member.kick(reason);

        const embed = new EmbedBuilder()
            .setColor('#e67e22') // Orange
            .setTitle('👟 Kullanıcı Atıldı')
            .addFields(
                { name: 'Kullanıcı', value: `${user.tag} (${user.id})` },
                { name: 'Sebep', value: reason },
                { name: 'Yetkili', value: interaction.user.tag }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
