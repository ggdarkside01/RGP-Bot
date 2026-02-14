const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filtre')
        .setDescription('Küfür filtresini yönetir.')
        .addSubcommand(sub =>
            sub.setName('ekle')
                .setDescription('Filtreye kelime ekler.')
                .addStringOption(opt => opt.setName('kelime').setDescription('Eklenecek kelime').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('sil')
                .setDescription('Filtreden kelime siler.')
                .addStringOption(opt => opt.setName('kelime').setDescription('Silinecek kelime').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('liste')
                .setDescription('Filtrelenen kelimeleri listeler.'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction, client) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!config.filter) config.filter = [];

        const subcommand = interaction.options.getSubcommand();
        const word = interaction.options.getString('kelime')?.toLowerCase();

        if (subcommand === 'ekle') {
            if (config.filter.includes(word)) return interaction.reply({ content: 'Bu kelime zaten filtrede var.', ephemeral: true });
            config.filter.push(word);
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            client.config = config; // Update runtime config
            return interaction.reply({ content: `\`${word}\` kelimesi başarıyla filtreye eklendi.`, ephemeral: true });
        }

        if (subcommand === 'sil') {
            if (!config.filter.includes(word)) return interaction.reply({ content: 'Bu kelime filtrede yok.', ephemeral: true });
            config.filter = config.filter.filter(w => w !== word);
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            client.config = config; // Update runtime config
            return interaction.reply({ content: `\`${word}\` kelimesi filtreden silindi.`, ephemeral: true });
        }

        if (subcommand === 'liste') {
            const list = config.filter.length > 0 ? config.filter.join(', ') : 'Filtre boş.';
            const embed = new EmbedBuilder()
                .setColor(client.config.styling.embedColor)
                .setTitle('🚫 Küfür Filtresi Listesi')
                .setDescription(list);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
