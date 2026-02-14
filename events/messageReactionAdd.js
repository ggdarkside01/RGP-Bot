const { Events, MessageFlags } = require('discord.js');
const { translateMessage, flagToLanguage } = require('../utils/translator');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user, client) {
        if (user.bot) return;

        // Partial check
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Reaksiyon çekilirken hata oluştu:', error);
                return;
            }
        }

        // Çeviri Sistemi Kontrolü
        if (flagToLanguage[reaction.emoji.name]) {
            const config = client.config || require('../config.json');
            const translatorConfig = config.translator || { allowedChannels: [] };

            // Kanal Kontrolü (Eğer liste boşsa her yerde çalışır, doluysa sadece listedekilerde)
            if (translatorConfig.allowedChannels.length > 0 && !translatorConfig.allowedChannels.includes(reaction.message.channel.id)) {
                return;
            }

            const message = reaction.message;
            const textToTranslate = message.content;

            if (!textToTranslate) return;

            console.log(`[TRANSLATOR] Çeviri başlatıldı: ${reaction.emoji.name} - Kullanıcı: ${user.tag}`);

            const translatedText = await translateMessage(textToTranslate, reaction.emoji.name);

            if (translatedText) {
                try {
                    await user.send({
                        content: `**[${reaction.emoji.name} Çeviri]**\n\n${translatedText}`,
                        flags: MessageFlags.Ephemeral
                    });

                    // Eğer DM kapalıysa veya bir şekilde DM atılamazsa kanala ephemeral mesaj atmayı deneyelim
                    // Ama meesageReactionAdd içinde ephemeral interaction cevabı veremeyiz (slash command değil)
                    // Bu yüzden DM en güvenli yol.
                } catch (err) {
                    console.log(`[TRANSLATOR] Kullanıcıya DM atılamadı: ${user.tag}`);
                }
            }
            return;
        }

        const config = client.config || require('../config.json');
        if (!config || reaction.message.id !== config.reactionMessageId) return;

        console.log(`[DEBUG] Reaksiyon algılandı: ${reaction.emoji.name} - Kullanıcı: ${user.tag}`);

        const rr = config.reactionRoles.find(r => r.emoji === reaction.emoji.name);
        if (!rr) {
            console.log(`[DEBUG] Emoji bulunamadı: ${reaction.emoji.name}`);
            return;
        }

        if (!reaction.message.guild) return;

        const member = await reaction.message.guild.members.fetch(user.id);
        const botMember = reaction.message.guild.members.me || await reaction.message.guild.members.fetch(reaction.client.user.id);

        if (member) {
            // Check if bot has Manage Roles permission
            if (!botMember.permissions.has('ManageRoles')) {
                console.error('[HATA] Botun "Rolleri Yönet" (Manage Roles) yetkisi yok!');
                return;
            }

            // Check role hierarchy
            const role = reaction.message.guild.roles.cache.get(rr.role);
            if (!role) {
                console.error(`[HATA] Rol bulunamadı: ${rr.role}`);
                return;
            }

            if (botMember.roles.highest.position <= role.position) {
                console.error(`[HATA] Botun rolü (${botMember.roles.highest.name}), verilmek istenen rolden (${role.name}) daha düşük veya aynı seviyede! Botun rolünü Discord ayarlarından yukarı taşıyın.`);
                return;
            }

            await member.roles.add(role)
                .then(() => console.log(`[DEBUG] Rol başarıyla verildi: ${role.name}`))
                .catch(err => {
                    if (err.code === 50013) {
                        console.error('[HATA] Eksik Yetki: Bot, bu kullanıcıya rol veremiyor (Muhtemelen kullanıcı Sunucu Sahibi veya botun üstünde bir role sahip).');
                    } else {
                        console.error('[DEBUG] Rol verilirken beklenmedik hata:', err);
                    }
                });
        }
    },
};

