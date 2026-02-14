const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Bir kullanıcıyı geçici olarak yasaklar.')
        .addUserOption(option => option.setName('kullanici').setDescription('Yasaklanacak kullanıcı').setRequired(true))
        .addStringOption(option => option.setName('sure').setDescription('Süre (örn: 1h, 1d, 1w)').setRequired(true))
        .addStringOption(option => option.setName('sebep').setDescription('Yasaklama sebebi').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction, client) {
        const user = interaction.options.getUser('kullanici');
        const durationStr = interaction.options.getString('sure');
        const reason = interaction.options.getString('sebep') || 'Belirtilmedi';

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (member && !member.bannable) {
            return interaction.reply({ content: 'Bu kullanıcıyı yasaklamak için yetkim yetmiyor!', flags: [MessageFlags.Ephemeral] });
        }

        // Parse duration
        const durationMatch = durationStr.match(/^(\d+)([hdw])$/);
        if (!durationMatch) {
            return interaction.reply({ content: 'Geçersiz süre formatı! Örnekler: 1h (1 saat), 1d (1 gün), 1w (1 hafta)', flags: [MessageFlags.Ephemeral] });
        }

        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2];
        let durationMs = 0;

        switch (unit) {
            case 'h': durationMs = value * 60 * 60 * 1000; break;
            case 'd': durationMs = value * 24 * 60 * 60 * 1000; break;
            case 'w': durationMs = value * 7 * 24 * 60 * 60 * 1000; break;
        }

        const unbanDate = Date.now() + durationMs;

        try {
            await interaction.guild.members.ban(user, { reason: `Tempban (${durationStr}): ${reason}` });

            // Save to file
            const bansPath = path.join(__dirname, '..', '..', 'temp-bans.json');
            let bans = [];
            if (fs.existsSync(bansPath)) {
                try { bans = JSON.parse(fs.readFileSync(bansPath, 'utf8')); } catch (e) { bans = []; }
            }

            bans.push({
                userId: user.id,
                guildId: interaction.guild.id,
                unbanDate: unbanDate,
                reason: reason,
                moderatorId: interaction.user.id
            });

            fs.writeFileSync(bansPath, JSON.stringify(bans, null, 4));

            const embed = new EmbedBuilder()
                .setColor(client.config.styling.errorColor)
                .setTitle('⏳ Geçici Yasaklama')
                .addFields(
                    { name: 'Kullanıcı', value: `${user.tag} (${user.id})` },
                    { name: 'Süre', value: durationStr },
                    { name: 'Bitiş Tarihi', value: `<t:${Math.floor(unbanDate / 1000)}:R>` },
                    { name: 'Sebep', value: reason },
                    { name: 'Yetkili', value: interaction.user.tag }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Yasaklama işlemi sırasında bir hata oluştu.', flags: [MessageFlags.Ephemeral] });
        }
    },
};
