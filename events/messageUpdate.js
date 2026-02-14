const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

        const logChannel = oldMessage.guild.channels.cache.get(client.config.logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('📝 Mesaj Düzenlendi')
            .addFields(
                { name: 'Kanal', value: `${oldMessage.channel}`, inline: true },
                { name: 'Gönderen', value: `${oldMessage.author.tag}`, inline: true },
                { name: 'Eski Mesaj', value: oldMessage.content || '*İçerik yok*' },
                { name: 'Yeni Mesaj', value: newMessage.content || '*İçerik yok*' }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
