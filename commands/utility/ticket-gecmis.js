const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-gecmis')
        .setDescription('Bir yetkilinin veya kullanıcının ticket geçmişini görüntüler.')
        .addUserOption(option =>
            option.setName('kullanici')
                .setDescription('İstatistikleri görüntülenecek kullanıcı (Boş bırakılırsa kendiniz)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('kullanici') || interaction.user;
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

        // Filter for target user
        // We look for tickets where the user is either the 'closedBy' or 'claimedBy'
        // Or even 'openedBy' if we want to show user stats. 
        // Based on the request image, it looks like staff stats.

        const userStats = stats.filter(s => s.closedBy === targetUser.id || s.claimedBy === targetUser.id);

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        const totalTickets = userStats.length;
        const totalMessages = userStats.reduce((acc, curr) => acc + (curr.messageCount || 0), 0);

        // Time based counts
        const last24h = userStats.filter(s => (now - s.closeTime) < oneDay).length;
        const last7d = userStats.filter(s => (now - s.closeTime) < oneWeek).length;
        const last30d = userStats.filter(s => (now - s.closeTime) < oneMonth).length;

        // Averages (using 7 days as a baseline for "weekly" avg if not 0)
        // If total tickets > 0, we can calculate daily average based on range of first to last ticket, or just divide by 30 for monthly avg.
        // Let's stick to simple averages based on the data points we calculated.

        const dailyAvg = (last30d / 30).toFixed(1);
        const weeklyAvg = (last30d / 4).toFixed(1);

        // Active Tickets (Current open channels)
        // We search for channels that start with 'claimed-' and have permission overwrite for this user?
        // Or simply iterate channels and check names/topics. 
        // A reliable way needs persistent storage for open tickets, which we don't fully have yet.
        // So we will stick to closed stats + maybe a simple check for open channels if possible.

        let activeTicketCount = 0;
        interaction.guild.channels.cache.forEach(c => {
            if (c.name.includes('ticket') || c.name.includes('destek') || c.name.startsWith('help-') || c.name.startsWith('buy-') || c.name.startsWith('other-') || c.name.startsWith('claimed-')) {
                // Check if user has access or is mentioned in topic/name
                if (c.permissionOverwrites.cache.has(targetUser.id)) {
                    // activeTicketCount++; // permission check might be too broad if they are admin
                }
                // If the channel name literally contains their name or ID (which we don't standardly do for claimed yet except 'claimed-')
            }
        });


        const embed = new EmbedBuilder()
            .setColor(client.config.styling.embedColor)
            .setAuthor({ name: `${targetUser.username} - Ticket Geçmişi`, iconURL: targetUser.displayAvatarURL() })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '📈 Toplam Ticket', value: `**${totalTickets}** ticket`, inline: true },
                { name: '✅ Kapatılan', value: `**${userStats.filter(s => s.closedBy === targetUser.id).length}** ticket`, inline: true },
                { name: '🔒 Açık', value: `**?** ticket`, inline: true }, // Placeholder as we don't track open status reliably yet

                { name: '💬 Toplam Mesaj', value: `**${totalMessages}** mesaj`, inline: true },
                { name: '📅 Son 24 Saat', value: `**${last24h}** ticket`, inline: true },
                { name: '📅 Son 7 Gün', value: `**${last7d}** ticket`, inline: true },

                { name: '📅 Son 30 Gün', value: `**${last30d}** ticket`, inline: true },
                { name: '📊 Ortalama (Günlük)', value: `**${dailyAvg}** ticket/gün`, inline: true },
                { name: '📊 Ortalama (Haftalık)', value: `**${weeklyAvg}** ticket/hafta`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
