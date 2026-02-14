const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const fs = require('fs');

const usersMap = new Map();

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        try {
            if (message.author.bot || !message.guild) return;

            // Auto Suggestion System
            if (client.config.suggestionChannelId && message.channel.id === client.config.suggestionChannelId) {
                const content = message.content;
                if (content.length < 5) {
                    await message.delete().catch(() => { });
                    const warning = await message.channel.send(`${message.author}, öneriniz çok kısa! Lütfen en az 5 karakter yazın.`);
                    setTimeout(() => warning.delete().catch(() => { }), 5000);
                    return;
                }

                await message.delete().catch(() => { });

                const embed = new EmbedBuilder()
                    .setColor(client.config.styling.embedColor)
                    .setTitle('💡 Yeni Öneri')
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                    .setDescription(content)
                    .addFields(
                        { name: '✅ Onayla', value: '0', inline: true },
                        { name: '❌ Reddet', value: '0', inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Vortex Suggestion • Oylayın!' });

                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('upvote_suggestion')
                        .setLabel('Onayla')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅'),
                    new ButtonBuilder()
                        .setCustomId('downvote_suggestion')
                        .setLabel('Reddet')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('❌')
                );

                const sentMessage = await message.channel.send({ embeds: [embed], components: [buttons] });

                // Initialize in suggestions_data.json
                const dataPath = path.join(__dirname, '..', 'suggestions_data.json');
                let data = {};
                if (fs.existsSync(dataPath)) {
                    try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch (e) { data = {}; }
                }
                data[sentMessage.id] = { upvotes: [], downvotes: [] };
                fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
                return;
            }

            const config = client.config.autoMod;
            if (config && config.enabled) {
                // Link Protection
                const hasLink = /(https?:\/\/[^\s]+)/g.test(message.content);
                if (hasLink) {
                    const isWhitelisted = config.linkWhitelist.some(link => message.content.includes(link));
                    const linkAllowedRoles = config.linkAllowedRoles || [];
                    const hasBypassRole = message.member?.roles.cache.some(role => linkAllowedRoles.includes(role.id));
                    const hasBypassPerm = message.member?.permissions.has('ManageMessages');

                    if (!isWhitelisted && !hasBypassRole && !hasBypassPerm) {
                        await message.delete().catch(() => { });
                        const warning = await message.channel.send(`${message.author}, bu sunucuda link paylaşımı yasaktır!`);
                        setTimeout(() => warning.delete().catch(() => { }), 5000);
                        return;
                    }
                }

                // Spam Protection
                const userData = usersMap.get(message.author.id);
                if (userData) {
                    const { lastMessage, count } = userData;
                    const diff = message.createdTimestamp - lastMessage.createdTimestamp;

                    if (diff < config.spamInterval) {
                        if (count >= config.spamThreshold) {
                            await message.delete().catch(() => { });

                            // Apply 10 second timeout (mute)
                            if (message.member) {
                                await message.member.timeout(10000, 'Spam koruması tetiklendi.').catch(() => { });
                                const warning = await message.channel.send(`${message.author}, çok hızlı yazdığın için 10 saniye susturuldun! Lütfen yavaşla.`);
                                setTimeout(() => warning.delete().catch(() => { }), 5000);
                            }
                            return;
                        }
                        usersMap.set(message.author.id, { lastMessage: message, count: count + 1 });
                    } else {
                        usersMap.set(message.author.id, { lastMessage: message, count: 1 });
                    }
                } else {
                    usersMap.set(message.author.id, { lastMessage: message, count: 1 });
                }
            }

            const filter = client.config.filter || [];
            if (filter.length === 0) return;

            const content = message.content.toLowerCase();
            const hasBadWord = filter.some(word => {
                const regex = new RegExp(`(?<=^|[^a-zA-ZçğıöşüÇĞİÖŞÜ])${word}(?=[^a-zA-ZçğıöşüÇĞİÖŞÜ]|$)`, 'iu');
                return regex.test(content);
            });

            if (hasBadWord) {
                try {
                    await message.delete();
                    const warning = await message.channel.send(`${message.author}, lütfen kullandığın kelimelere dikkat et! Sunucuda küfür/hakaret yasaktır.`);
                    setTimeout(() => warning.delete().catch(() => { }), 5000);
                } catch (err) {
                    console.error('Mesaj silinirken hata oluştu:', err);
                }
            }
        } catch (error) {
            console.error(' [HATA] messageCreate hatası:', error);
        }
    },

};
