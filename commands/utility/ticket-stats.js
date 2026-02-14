const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-istatistik')
        .setDescription('Destek talebi istatistiklerini görüntüler.')
        .addStringOption(option =>
            option.setName('sure')
                .setDescription('Hangi zaman aralığı için istatistik gösterilsin?')
                .setRequired(true)
                .addChoices(
                    { name: 'Son 24 Saat', value: '1d' },
                    { name: 'Son 1 Hafta', value: '1w' },
                    { name: 'Son 1 Ay', value: '1mo' },
                    { name: 'Tüm Zamanlar', value: 'all' }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction, client) {
        const duration = interaction.options.getString('sure');
        const statsPath = path.join(__dirname, '..', '..', 'ticket-data.json');

        if (!fs.existsSync(statsPath)) {
            return interaction.reply({ content: 'Henüz kaydedilmiş bir istatistik verisi bulunamadı.', flags: [MessageFlags.Ephemeral] });
        }

        let stats = [];
        try {
            stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        } catch (e) {
            return interaction.reply({ content: 'İstatistik dosyası okunurken hata oluştu.', flags: [MessageFlags.Ephemeral] });
        }

        if (stats.length === 0) {
            return interaction.reply({ content: 'Henüz kaydedilmiş bir veri yok.', flags: [MessageFlags.Ephemeral] });
        }

        // Filter based on time
        const now = Date.now();
        let filteredStats = stats;
        let timeText = 'Tüm Zamanlar';

        if (duration !== 'all') {
            let limit = 0;
            switch (duration) {
                case '1d':
                    limit = 24 * 60 * 60 * 1000;
                    timeText = 'Son 24 Saat';
                    break;
                case '1w':
                    limit = 7 * 24 * 60 * 60 * 1000;
                    timeText = 'Son 1 Hafta';
                    break;
                case '1mo':
                    limit = 30 * 24 * 60 * 60 * 1000;
                    timeText = 'Son 1 Ay';
                    break;
            }
            filteredStats = stats.filter(s => (now - s.closeTime) < limit);
        }

        if (filteredStats.length === 0) {
            return interaction.reply({ content: `**${timeText}** içinde kapatılmış bir talep bulunamadı.`, flags: [MessageFlags.Ephemeral] });
        }

        // Aggregate Data
        const totalTickets = filteredStats.length;
        const totalMessages = filteredStats.reduce((acc, curr) => acc + (curr.messageCount || 0), 0);

        // Staff Performance (Tickets Claimed/Handled)
        const staffMap = {};

        filteredStats.forEach(stat => {
            // Count 'closedBy' actions
            // Or 'claimedBy' actions if available.
            // Let's track unique tickets handled by staff (claimed or closed)

            const staffId = stat.claimedBy !== 'Unclaimed' ? stat.claimedBy : stat.closedBy;
            if (staffId && staffId !== 'Unclaimed') {
                if (!staffMap[staffId]) staffMap[staffId] = { tickets: 0, messages: 0 };
                staffMap[staffId].tickets += 1;
                // Messages are total in ticket, not per staff, but we can sum them up as "traffic handled"
                staffMap[staffId].messages += (stat.messageCount || 0);
            }
        });

        const sortedStaff = Object.entries(staffMap)
            .sort(([, a], [, b]) => b.tickets - a.tickets)
            .slice(0, 10); // Top 10

        const embed = new EmbedBuilder()
            .setColor(client.config.styling.embedColor)
            .setTitle(`📊 Ticket İstatistikleri (${timeText})`)
            .addFields(
                { name: 'Toplam Ticket', value: `${totalTickets}`, inline: true },
                { name: 'Toplam Mesaj', value: `${totalMessages}`, inline: true },
                { name: 'Ortalama Mesaj/Ticket', value: `${(totalMessages / totalTickets).toFixed(1)}`, inline: true }
            )
            .setTimestamp();

        if (sortedStaff.length > 0) {
            const staffField = sortedStaff.map(([id, data], index) => {
                return `${index + 1}. <@${id}>: **${data.tickets}** ticket (${data.messages} mesaj)`;
            }).join('\n');
            embed.addFields({ name: '🏆 En Çok İlgilenen Yetkililer', value: staffField });
        } else {
            embed.addFields({ name: '🏆 Yetkili İstatistikleri', value: 'Veri yok.' });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
