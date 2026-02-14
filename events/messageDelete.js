const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,
    async execute(message, client) {
        if (message.author?.bot || !message.guild) return;

        const logChannel = message.guild.channels.cache.get(client.config.logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🗑️ Mesaj Silindi')
            .addFields(
                { name: 'Kanal', value: `${message.channel}`, inline: true },
                { name: 'Gönderen', value: `${message.author.tag}`, inline: true },
                { name: 'İçerik', value: message.content || '*İçerik yok (Resim/Embed olabilir)*' }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
