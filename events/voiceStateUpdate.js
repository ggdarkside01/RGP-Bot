const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        const logChannel = oldState.guild.channels.cache.get(client.config.logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder().setTimestamp();
        const user = newState.member.user;

        if (!oldState.channelId && newState.channelId) {
            embed.setColor('#2ecc71').setTitle('🔊 Sese Katıldı').setDescription(`${user.tag} bir ses kanalına katıldı: <#${newState.channelId}>`);
        } else if (oldState.channelId && !newState.channelId) {
            embed.setColor('#e74c3c').setTitle('🔇 Sesten Ayrıldı').setDescription(`${user.tag} ses kanalından ayrıldı: <#${oldState.channelId}>`);
        } else if (oldState.channelId !== newState.channelId) {
            embed.setColor('#3498db').setTitle('🔁 Ses Kanalı Değiştirdi').setDescription(`${user.tag} kanal değiştirdi: <#${oldState.channelId}> ➡️ <#${newState.channelId}>`);
        } else return;

        logChannel.send({ embeds: [embed] });
    },
};
