const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Çalan şarkıyı atlar ve sıradakine geçer.'),
    async execute(interaction, client) {
        const queue = client.queues.get(interaction.guildId);

        if (!queue || queue.songs.length === 0) {
            return interaction.reply({ content: 'Şu an çalan bir şarkı yok!', ephemeral: true });
        }

        if (!interaction.member.voice.channel || interaction.member.voice.channel.id !== queue.connection.joinConfig.channelId) {
            return interaction.reply({ content: 'Şarkıyı atlamak için botla aynı ses kanalında olmalısın!', ephemeral: true });
        }

        queue.player.stop(); // This will trigger the 'Idle' event and play the next song
        await interaction.reply('⏭️ Şarkı atlandı.');
    },
};
