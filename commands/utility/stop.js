const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Müziği durdurur ve ses kanalından ayrılır.'),
    async execute(interaction, client) {
        const queue = client.queues.get(interaction.guildId);
        const connection = getVoiceConnection(interaction.guildId);

        if (!connection) {
            return interaction.reply({ content: 'Bot şu an herhangi bir ses kanalında değil!', ephemeral: true });
        }

        if (queue) {
            queue.songs = [];
            queue.player.stop();
            client.queues.delete(interaction.guildId);
        }

        connection.destroy();
        await interaction.reply('👋 Ses kanalından ayrıldım ve sırayı temizledim.');
    },
};
