const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bir kullanıcıyı sunucudan yasaklar.')
        .addUserOption(option => option.setName('kullanici').setDescription('Yasaklanacak kullanıcı').setRequired(true))
        .addStringOption(option => option.setName('sebep').setDescription('Yasaklama sebebi').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('kullanici');
        const reason = interaction.options.getString('sebep') || 'Belirtilmedi';

        const member = await interaction.guild.members.fetch(user.id);
        if (!member.bannable) {
            return interaction.reply({ content: 'Bu kullanıcıyı yasaklamak için yetkim yetmiyor!', ephemeral: true });
        }

        await member.ban({ reason });

        const embed = new EmbedBuilder()
            .setColor(client.config.styling.errorColor)
            .setTitle('🔨 Kullanıcı Yasaklandı')
            .addFields(
                { name: 'Kullanıcı', value: `${user.tag} (${user.id})` },
                { name: 'Sebep', value: reason },
                { name: 'Yetkili', value: interaction.user.tag }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
