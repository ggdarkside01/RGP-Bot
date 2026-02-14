const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member, client) {
        const logChannelId = client.config.logChannelId;
        const logChannel = member.guild.channels.cache.get(logChannelId);

        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('📤 Sunucudan Ayrıldı!')
            .setDescription(`${member.user.tag} sunucudan ayrıldı. Görüşmek üzere!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Kullanıcı', value: member.user.tag, inline: true },
                { name: 'Sunucu Mevcudu', value: `${member.guild.memberCount}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `${member.guild.name}`, iconURL: member.guild.iconURL() });

        await logChannel.send({ embeds: [embed] });
    },
};
