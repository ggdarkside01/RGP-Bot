const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temizle-sira')
        .setDescription('Tüm şarkı sırasını temizler.'),
    async execute(interaction, client) {
        const queue = client.queues.get(interaction.guildId);

        if (!queue) {
            return interaction.reply({ content: 'Şu an aktif bir sıra yok!', ephemeral: true });
        }

        if (!interaction.member.voice.channel || interaction.member.voice.channel.id !== queue.connection.joinConfig.channelId) {
            return interaction.reply({ content: 'Sırayı temizlemek için botla aynı ses kanalında olmalısın!', ephemeral: true });
        }

        queue.songs = [];
        queue.player.stop();
        await interaction.reply('🧹 Şarkı sırası başarıyla temizlendi.');
    },
};
