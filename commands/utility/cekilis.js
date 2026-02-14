const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cekilis')
        .setDescription('Sunucuda çekiliş düzenler.')
        .addStringOption(option => option.setName('odul').setDescription('Çekiliş ödülü nedir?').setRequired(true))
        .addStringOption(option => option.setName('sure').setDescription('Süre (Örn: 10m, 2h, 1d)').setRequired(true))
        .addIntegerOption(option => option.setName('kazanan').setDescription('Kazanan sayısı').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),
    async execute(interaction, client) {
        const prize = interaction.options.getString('odul');
        const durationStr = interaction.options.getString('sure');
        const winnersCount = interaction.options.getInteger('kazanan');

        const durationMs = parseDuration(durationStr);
        if (!durationMs) {
            return interaction.reply({ content: 'Geçersiz süre formatı! Lütfen `10m`, `2h` veya `1d` gibi formatlar kullanın.', ephemeral: true });
        }

        const endTime = Date.now() + durationMs;
        const embed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('🎉 ÇEKİLİŞ BAŞLADI 🎉')
            .setDescription(`**Ödül:** ${prize}\n**Bitiş:** <t:${Math.floor(endTime / 1000)}:R>\n**Kazanan Sayısı:** ${winnersCount}`)
            .setFooter({ text: 'Katılmak için aşağıdaki emojiye tıkla!' });

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react('🎉');

        // Log giveaway start
        const logChannel = client.channels.cache.get(client.config.logChannelId);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#f1c40f')
                .setTitle('📢 Çekiliş Başlatıldı')
                .addFields(
                    { name: 'Ödül', value: prize, inline: true },
                    { name: 'Süre', value: durationStr, inline: true },
                    { name: 'Başlatan', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();
            logChannel.send({ embeds: [logEmbed] }).catch(() => { });
        }

        const selectWinners = async () => {
            try {
                const updatedMessage = await interaction.channel.messages.fetch(message.id);
                const reaction = updatedMessage.reactions.cache.get('🎉');
                if (!reaction) return;

                const users = await reaction.users.fetch();
                const participants = users.filter(user => !user.bot).map(user => user);

                if (participants.length < winnersCount) {
                    const failEmbed = new EmbedBuilder()
                        .setColor('#ff4d4d')
                        .setTitle('❌ ÇEKİLİŞ İPTAL EDİLDİ ❌')
                        .setDescription(`Yeterli katılım olmadığı için çekiliş iptal edildi.\n**Ödül:** ${prize}`)
                        .setTimestamp();
                    interaction.channel.send({ embeds: [failEmbed] });

                    // Log failure
                    if (logChannel) {
                        const failLog = new EmbedBuilder()
                            .setColor('#ff4d4d')
                            .setTitle('📢 Çekiliş İptal Edildi')
                            .setDescription(`Yeterli katılım olmadığı için çekiliş iptal edildi.\n**Ödül:** ${prize}`)
                            .setTimestamp();
                        logChannel.send({ embeds: [failLog] }).catch(() => { });
                    }
                    return;
                }

                const winners = [];
                for (let i = 0; i < winnersCount; i++) {
                    if (participants.length === 0) break;
                    const index = Math.floor(Math.random() * participants.length);
                    const winner = participants[index];
                    winners.push(winner.toString());
                    participants.splice(index, 1);
                }

                const winnerEmbed = new EmbedBuilder()
                    .setColor('#2ecc71')
                    .setTitle('🎊 ÇEKİLİŞ SONUÇLANDI 🎊')
                    .setDescription(`**Ödül:** ${prize}\n**Kazananlar:** ${winners.join(', ')}`)
                    .setTimestamp();

                await interaction.channel.send({ content: `Tebrikler ${winners.join(', ')}! **${prize}** kazandınız!`, embeds: [winnerEmbed] });

                // Log winners
                if (logChannel) {
                    const winLog = new EmbedBuilder()
                        .setColor('#2ecc71')
                        .setTitle('📢 Çekiliş Sonuçlandı')
                        .addFields(
                            { name: 'Ödül', value: prize, inline: true },
                            { name: 'Kazananlar', value: winners.join(', '), inline: false }
                        )
                        .setTimestamp();
                    logChannel.send({ embeds: [winLog] }).catch(() => { });
                }

                client.activeGiveaways.delete(message.id);
            } catch (error) {
                console.error('Çekiliş sonlandırma hatası:', error);
            }
        };

        const timeout = setTimeout(selectWinners, durationMs);
        client.activeGiveaways.set(message.id, {
            timeout,
            prize,
            winnersCount,
            selectWinners
        });
    },
};

function parseDuration(str) {
    const match = str.match(/^(\d+)([mhd])$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
}
