const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urun-link')
        .setDescription('Bir ürünün indirme/satış linkini profesyonel bir kart ile paylaşır.')
        .addStringOption(option => option.setName('baslik').setDescription('Ürün adı').setRequired(true))
        .addStringOption(option => option.setName('link').setDescription('İndirme/Satış linki (URL)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction, client) {
        const baslik = interaction.options.getString('baslik');
        let link = interaction.options.getString('link');

        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            link = `https://${link}`;
        }

        const embed = new EmbedBuilder()
            .setColor(client.config.styling.successColor)
            .setTitle(`📦 ${baslik}`)
            .setDescription('Bu ürünü indirmek veya satın almak için aşağıdaki bağlantıyı kullanabilirsiniz.')
            .addFields(
                { name: '🔗 Bağlantı', value: `[Buraya Tıkla](${link})` }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} Mağaza`, iconURL: interaction.guild.iconURL() });

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: 'Ürün linki başarıyla paylaşıldı!', ephemeral: true });
    },
};
