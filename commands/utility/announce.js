const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duyuru')
        .setDescription('Şık bir embed ile duyuru hazırlamanızı sağlar (Modal açar).')
        .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone),
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('announce_modal')
            .setTitle('📢 Duyuru Hazırla');

        const titleInput = new TextInputBuilder()
            .setCustomId('ann_title')
            .setLabel('Duyuru Başlığı')
            .setPlaceholder('Buraya başlığı yazın...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const contentInput = new TextInputBuilder()
            .setCustomId('ann_content')
            .setLabel('Duyuru İçeriği')
            .setPlaceholder('Buraya duyuru metnini yazın... (Enter ile alt satıra geçebilirsiniz)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const imageInput = new TextInputBuilder()
            .setCustomId('ann_image')
            .setLabel('Resim URL (Opsiyonel)')
            .setPlaceholder('https://example.com/resim.png')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(contentInput),
            new ActionRowBuilder().addComponents(imageInput)
        );

        await interaction.showModal(modal);
    },
};
