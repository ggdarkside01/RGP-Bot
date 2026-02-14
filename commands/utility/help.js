const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('komutlar')
        .setDescription('Bottaki tüm komutları listeler.'),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor(client.config.styling.embedColor)
            .setTitle('📖 Vortex Bot Komut Listesi')
            .setDescription('İşte kullanabileceğin tüm komutlar:')
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();

        // Categorize commands
        const categories = {
            moderation: '⚒️ Moderasyon',
            utility: '🛠️ Genel/Yardım',
            economy: '💰 Ekonomi',
            rp: '🎭 Roleplay'
        };

        const commandsPath = path.join(__dirname, '..'); // This points to the 'commands' directory
        const commandFolders = fs.readdirSync(commandsPath);

        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (!fs.statSync(folderPath).isDirectory()) continue; // Skip if it's not a directory

            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            let categoryName = categories[folder] || folder.charAt(0).toUpperCase() + folder.slice(1);

            let commandList = '';
            let fieldCount = 1;

            for (const file of commandFiles) {
                const command = require(path.join(folderPath, file));
                const line = `\`/${command.data.name}\` - ${command.data.description}\n`;

                if ((commandList + line).length > 1024) {
                    embed.addFields({ name: `${categoryName} (${fieldCount})`, value: commandList });
                    commandList = line;
                    fieldCount++;
                    categoryName = `${categoryName} (Devam)`; // Update name for next fields
                } else {
                    commandList += line;
                }
            }

            if (commandList) {
                embed.addFields({ name: fieldCount > 1 ? `${categoryName} (${fieldCount})` : categoryName, value: commandList });
            }
        }

        await interaction.reply({ embeds: [embed] });
    },
};
