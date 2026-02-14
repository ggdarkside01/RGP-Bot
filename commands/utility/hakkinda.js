const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hakkinda')
        .setDescription('Vortex ekosistemi ve bot hakkında detaylı bilgi verir.'),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor(client.config.styling.embedColor || '#00ff00')
            .setTitle('🌀 RGP Shop Ecosystem | Genel Bakış')
            .setAuthor({ name: 'RGP Shop Identity', iconURL: client.user.displayAvatarURL() })
            .setDescription('RGP Shop, sunucunuzu profesyonel bir düzeye taşımak için tasarlanmış gelişmiş bir bot ekosistemidir. Her bot, kendi alanında uzmanlaşmış özelliklerle donatılmıştır.')
            .addFields(
                {
                    name: '🚀 Ana Bot (RGP Shop-Main)',
                    value: 'Sistemin kalbidir. Genel araçlar, duyurular, oylamalar ve ekosistemin yönetimi burada gerçekleşir.'
                },
                {
                    name: '🛡️ Güvenlik & Moderasyon',
                    value: 'Gelişmiş Auto-Mod ve küfür filtresi ile sunucunuzu korur. Link koruması ve spam önleme sistemleri ile huzuru sağlar.'
                },
                {
                    name: '🎫 Destek & Ticket Sistemi',
                    value: 'Kullanıcılarınızın sorunlarını kategorize ederek çözer. Profesyonel transkript ve yetkili istatistik sistemi içerir.'
                },
                {
                    name: '🎵 Eğlence & Müzik',
                    value: 'En yüksek kalitede ses deneyimi sunan müzik altyapısı ve gelişmiş çekiliş (Giveaway) sistemleri mevcuttur.'
                }
            )
            .setImage('https://i.imgur.com/8Q9Y7O5.png') // Example high-tech banner if needed
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: 'RGP Shop • Profesyonel Sunucu Çözümleri', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
