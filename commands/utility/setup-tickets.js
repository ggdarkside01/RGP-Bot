const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-kurulum')
        .setDescription('Destek sistemi için giriş mesajını oluşturur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor(client.config.styling.embedColor)
            .setTitle('🎫 Destek Merkezi')
            .setDescription('Bir sorununuz veya talebiniz varsa, aşağıdaki butona tıklayarak bir destek talebi oluşturabilirsiniz.\n\n**Kurallar:**\n- Gereksiz talep açmak yasaktır.\n- Yetkilileri gereksiz etiketlemeyin.')
            .setFooter({ text: 'Vortex Bot Destek Sistemi' });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_category')
                    .setPlaceholder('Destek kategorisi seçin...')
                    .addOptions([
                        {
                            label: 'Yardım',
                            description: 'Genel yardım ve teknik destek.',
                            value: 'help',
                            emoji: '🆘',
                        },
                        {
                            label: 'Satın Alım',
                            description: 'Store ve market satın alımları.',
                            value: 'buy',
                            emoji: '💰',
                        },
                        {
                            label: 'Diğer',
                            description: 'Diğer konular ve şikayetler.',
                            value: 'other',
                            emoji: '📁',
                        },
                    ]),
            );

        await interaction.reply({ content: 'Kategorili talep sistemi mesajı gönderiliyor...', flags: [MessageFlags.Ephemeral] });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    },
};
