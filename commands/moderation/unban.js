const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Bir kullanıcının yasağını kaldırır.')
        .addStringOption(option => option.setName('kullanici_id').setDescription('Yasağı kaldırılacak kullanıcının ID\'si').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction, client) {
        const userId = interaction.options.getString('kullanici_id');

        try {
            await interaction.guild.members.unban(userId);

            // Remove from temp-bans if exists
            const bansPath = path.join(__dirname, '..', '..', 'temp-bans.json');
            if (fs.existsSync(bansPath)) {
                let bans = JSON.parse(fs.readFileSync(bansPath, 'utf8'));
                const initialLength = bans.length;
                bans = bans.filter(ban => ban.userId !== userId);
                if (bans.length !== initialLength) {
                    fs.writeFileSync(bansPath, JSON.stringify(bans, null, 4));
                }
            }

            const embed = new EmbedBuilder()
                .setColor(client.config.styling.successColor || '#00ff00')
                .setTitle('🔓 Yasak Kaldırıldı')
                .setDescription(`<@${userId}> kullanıcısının yasağı kaldırıldı.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Yasak kaldırılırken bir hata oluştu veya kullanıcı yasaklı değil.', flags: [MessageFlags.Ephemeral] });
        }
    },
};
