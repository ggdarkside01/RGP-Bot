const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageReactionRemove,
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

        const config = client.config || require('../config.json');
        if (!config || reaction.message.id !== config.reactionMessageId) return;

        console.log(`[DEBUG] Reaksiyon kaldırıldı: ${reaction.emoji.name} - Kullanıcı: ${user.tag}`);

        const rr = config.reactionRoles.find(r => r.emoji === reaction.emoji.name);
        if (!rr) {
            console.log(`[DEBUG] Emoji bulunamadı: ${reaction.emoji.name}`);
            return;
        }

        const member = await reaction.message.guild.members.fetch(user.id);
        if (member) {
            await member.roles.remove(rr.role)
                .then(() => console.log(`[DEBUG] Rol başarıyla alındı: ${rr.role}`))
                .catch(err => console.error('[DEBUG] Rol alınırken hata:', err));
        }
    },
};
