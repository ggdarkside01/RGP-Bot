const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member, client) {
        const logChannelId = client.config.logChannelId;
        const logChannel = member.guild.channels.cache.get(logChannelId);

        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('📥 Sunucuya Katıldı!')
            .setDescription(`Aramıza hoş geldin ${member}!`)
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
