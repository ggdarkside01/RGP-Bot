const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oneri-ayarla')
        .setDescription('Öneri kanalını ayarlar.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Önerilerin gönderileceği kanal (Opsiyonel: Girilmezse bu kanalı ayarlar)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('kanal') || interaction.channel;

        // Update config
        const configPath = path.join(__dirname, '..', 'config.json');
        client.config.suggestionChannelId = channel.id;

        fs.writeFileSync(configPath, JSON.stringify(client.config, null, 4));

        const embed = new EmbedBuilder()
            .setColor(client.config.styling.successColor)
            .setTitle('✅ Öneri Sistemi Kuruldu')
            .setDescription(`Bu kanal (<#${channel.id}>) artık bir öneri kanalıdır. Buraya yazılan her mesaj otomatik olarak öneriye dönüştürülecektir.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
