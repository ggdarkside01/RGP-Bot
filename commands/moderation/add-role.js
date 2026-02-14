const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rol-ver')
        .setDescription('Bir kullanıcıya belirtilen rolü verir.')
        .addUserOption(option => option.setName('kullanici').setDescription('Rol verilecek kullanıcı').setRequired(true))
        .addRoleOption(option => option.setName('rol').setDescription('Verilecek rol').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction, client) {
        const user = interaction.options.getMember('kullanici');
        const role = interaction.options.getRole('rol');

        if (!user) {
            return interaction.reply({ content: 'Kullanıcı bulunamadı!', ephemeral: true });
        }

        try {
            await user.roles.add(role);

            const embed = new EmbedBuilder()
                .setColor(client.config.styling.successColor)
                .setTitle('✅ Rol Verildi')
                .setDescription(`${user} kullanıcısına **${role.name}** rolü başarıyla eklendi.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Bu rolü vermek için yetkim yetmiyor veya bir hata oluştu!', ephemeral: true });
        }
    },
};
