const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urun-tanit')
        .setDescription('Bir ürünü profesyonel bir kart ile tanıtır.')
        .addStringOption(option => option.setName('baslik').setDescription('Ürün adı/başlığı').setRequired(true))
        .addStringOption(option => option.setName('aciklama').setDescription('Ürün açıklaması').setRequired(true))
        .addStringOption(option => option.setName('fiyat').setDescription('Ürün fiyatı').setRequired(true))
        .addStringOption(option => option.setName('resim').setDescription('Ürün resim linki (URL)').setRequired(false))
        .addStringOption(option => option.setName('video').setDescription('Ürün video linki (YouTube/URL)').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction, client) {
        const baslik = interaction.options.getString('baslik');
        const aciklama = interaction.options.getString('aciklama');
        const fiyat = interaction.options.getString('fiyat');
        const resim = interaction.options.getString('resim');
        const video = interaction.options.getString('video');

        const embed = new EmbedBuilder()
            .setColor(client.config.styling.embedColor)
            .setTitle(`💎 ${baslik}`)
            .setDescription(aciklama)
            .addFields(
                { name: '💰 Fiyat', value: `\`${fiyat}\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} Ürün Tanıtımı`, iconURL: interaction.guild.iconURL() });

        if (resim && resim.startsWith('http')) {
            embed.setImage(resim);
        }

        if (video) {
            embed.addFields({ name: '🎬 Tanıtım Videosu', value: `[Videoyu İzle](${video})`, inline: true });
        }

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: 'Ürün tanıtımı başarıyla paylaşıldı!', ephemeral: true });
    },
};
