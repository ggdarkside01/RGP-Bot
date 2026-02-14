const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Kanalı mesaj gönderimine kapatır.')
        .addChannelOption(option => option.setName('kanal').setDescription('Kilitlenecek kanal (boş bırakılırsa mevcut kanal)').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('kanal') || interaction.channel;

        try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: false,
            });

            const embed = new EmbedBuilder()
                .setColor(client.config.styling.errorColor)
                .setTitle('🔒 Kanal Kilitlendi')
                .setDescription(`Bu kanal **${interaction.user.tag}** tarafından kilitlendi.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            if (channel.id !== interaction.channel.id) {
                await channel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Kanal kilitlenirken bir hata oluştu.', flags: [MessageFlags.Ephemeral] });
        }
    },
};
