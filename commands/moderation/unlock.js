const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Kanalı mesaj gönderimine açar.')
        .addChannelOption(option => option.setName('kanal').setDescription('Açılacak kanal (boş bırakılırsa mevcut kanal)').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('kanal') || interaction.channel;

        try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: null, // Reset to default (usually allows if role has permissions)
            });

            const embed = new EmbedBuilder()
                .setColor(client.config.styling.successColor || '#00ff00')
                .setTitle('🔓 Kanal Açıldı')
                .setDescription(`Bu kanal **${interaction.user.tag}** tarafından açıldı.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            if (channel.id !== interaction.channel.id) {
                await channel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Kanal açılırken bir hata oluştu.', flags: [MessageFlags.Ephemeral] });
        }
    },
};
