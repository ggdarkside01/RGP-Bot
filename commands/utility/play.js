const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const play = require('play-dl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Bir video linki ile şarkı çalar veya sıraya ekler.')
        .addStringOption(option => option.setName('link').setDescription('YouTube video linki').setRequired(true)),
    async execute(interaction, client) {
        const url = interaction.options.getString('link');

        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'Bu komutu kullanmak için bir ses kanalında olmalısın!', ephemeral: true });
        }

        await interaction.deferReply();

        let queue = client.queues.get(interaction.guildId);

        if (!queue) {
            queue = {
                connection: null,
                player: createAudioPlayer({
                    behaviors: { noSubscriber: NoSubscriberBehavior.Play },
                }),
                songs: [],
                textChannel: interaction.channel,
            };
            client.queues.set(interaction.guildId, queue);

            queue.connection = joinVoiceChannel({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            queue.connection.subscribe(queue.player);

            queue.player.on(AudioPlayerStatus.Idle, () => {
                queue.songs.shift();
                if (queue.songs.length > 0) {
                    playSong(queue.songs[0], queue);
                } else {
                    // Stay in channel but stop playing
                }
            });

            queue.player.on('error', error => {
                console.error('Player error:', error);
                queue.songs.shift();
                if (queue.songs.length > 0) playSong(queue.songs[0], queue);
            });
        }

        try {
            const songInfo = await play.video_info(url);
            const song = {
                title: songInfo.video_details.title,
                url: songInfo.video_details.url,
                duration: songInfo.video_details.durationRaw,
                thumbnail: songInfo.video_details.thumbnails[0].url
            };

            queue.songs.push(song);

            if (queue.songs.length === 1) {
                playSong(song, queue);
                const embed = new EmbedBuilder()
                    .setColor(client.config.styling.embedColor)
                    .setTitle('🎶 Şarkı Başlatıldı')
                    .setDescription(`**[${song.title}](${song.url})**`)
                    .setThumbnail(song.thumbnail)
                    .addFields({ name: 'Süre', value: song.duration, inline: true })
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('➕ Sıraya Eklendi')
                    .setDescription(`**[${song.title}](${song.url})**`)
                    .addFields({ name: 'Sıradaki Pozisyon', value: `${queue.songs.length - 1}`, inline: true })
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('Şarkı bilgileri alınırken bir hata oluştu. Geçerli bir YouTube linki girdiğinden emin ol.');
        }

        async function playSong(song, guildQueue) {
            const stream = await play.stream(song.url);
            const resource = createAudioResource(stream.stream, { inputType: stream.type });
            guildQueue.player.play(resource);
        }
    },
};
