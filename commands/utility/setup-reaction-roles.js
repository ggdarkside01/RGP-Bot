const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaksiyon-rol-kurulum')
        .setDescription('Kullanıcıların emojiye basarak rol alabileceği mesajı oluşturur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const configPath = path.join(__dirname, '../../config.json');
        const config = client.config;

        const embed = new EmbedBuilder()
            .setColor(client.config.styling.embedColor)
            .setTitle('🎭 Rol Seçim Merkezi')
            .setDescription('Aşağıdaki emojilere tıklayarak sunucuda ilgili rolleri alabilirsiniz.\n\n' +
                config.reactionRoles.map(rr => `${rr.emoji} - <@&${rr.role}>`).join('\n'))
            .setFooter({ text: 'Vortex Bot Reaksiyon Sistemi' });

        const message = await interaction.channel.send({ embeds: [embed] });

        // Save message ID to config first
        config.reactionMessageId = message.id;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        client.config = config;

        await interaction.editReply({ content: 'Reaksiyon rol mesajı başarıyla oluşturuldu! Emojiler ekleniyor...' });

        // Add initial reactions AFTER replying to avoid timeout
        for (const rr of config.reactionRoles) {
            if (rr.role && rr.role.length > 10 && !rr.role.startsWith("ROL_ID")) {
                await message.react(rr.emoji).catch(() => { });
            }
        }
    },
};
