const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        try {
            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'announce_modal') {
                    try {
                        const title = interaction.fields.getTextInputValue('ann_title');
                        const content = interaction.fields.getTextInputValue('ann_content');
                        const image = interaction.fields.getTextInputValue('ann_image');

                        const embed = new EmbedBuilder()
                            .setColor(client.config.styling.embedColor)
                            .setTitle(title)
                            .setDescription(content)
                            .setTimestamp()
                            .setFooter({ text: `Duyuruyu yapan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

                        if (image) {
                            embed.setImage(image);
                        }

                        await interaction.channel.send({ content: '@everyone', embeds: [embed] });
                        await interaction.reply({ content: 'Duyuru başarıyla gönderildi!', flags: [MessageFlags.Ephemeral] });
                    } catch (error) {
                        console.error('Duyuru gönderilirken hata:', error);
                        await interaction.reply({ content: 'Duyuru gönderilirken bir hata oluştu.', flags: [MessageFlags.Ephemeral] });
                    }
                }

                if (interaction.customId === 'suggestion_modal') {
                    const content = interaction.fields.getTextInputValue('suggestion_content');
                    const channelId = client.config.suggestionChannelId;
                    const channel = interaction.guild.channels.cache.get(channelId);

                    if (!channel) return interaction.reply({ content: 'Öneri kanalı bulunamadı!', flags: [MessageFlags.Ephemeral] });

                    const embed = new EmbedBuilder()
                        .setColor(client.config.styling.embedColor)
                        .setTitle('💡 Yeni Öneri')
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(content)
                        .addFields(
                            { name: '👍 Evet', value: '0', inline: true },
                            { name: '👎 Hayır', value: '0', inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Vortex Suggestion • Oylayın!' });

                    const buttons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('upvote_suggestion')
                            .setLabel('Evet')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('👍'),
                        new ButtonBuilder()
                            .setCustomId('downvote_suggestion')
                            .setLabel('Hayır')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('👎')
                    );

                    const message = await channel.send({ embeds: [embed], components: [buttons] });

                    // Initialize in suggestions_data.json
                    const dataPath = path.join(__dirname, '..', 'suggestions_data.json');
                    let data = {};
                    if (fs.existsSync(dataPath)) {
                        try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch (e) { data = {}; }
                    }
                    data[message.id] = { upvotes: [], downvotes: [] };
                    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));

                    await interaction.reply({ content: 'Öneriniz başarıyla gönderildi!', flags: [MessageFlags.Ephemeral] });
                }
                return;
            }

            if (interaction.isStringSelectMenu()) {
                if (interaction.customId === 'ticket_category') {
                    const category = interaction.values[0];
                    const categoryNames = { help: 'Yardım', buy: 'Satın Alım', other: 'Diğer' };

                    await interaction.reply({ content: 'Destek talebiniz oluşturuluyor...', flags: [MessageFlags.Ephemeral] });

                    const channel = await interaction.guild.channels.create({
                        name: `${category}-${interaction.user.username}`,
                        reason: 'Destek Talebi',
                        permissionOverwrites: [
                            { id: interaction.guild.id, deny: ['ViewChannel'] },
                            { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
                            // Add moderator role ID here if needed
                        ],
                    });

                    const welcomeEmbed = new EmbedBuilder()
                        .setColor(client.config.styling.embedColor)
                        .setTitle('🎫 Destek Talebi')
                        .setDescription(`Merhaba ${interaction.user}, **${categoryNames[category]}** kategorisinde bir talep açtınız. \n\nLütfen sorununuzu detaylıca buraya yazın, yetkililerimiz en kısa sürede yardımcı olacaktır.`)
                        .addFields(
                            { name: 'Kullanıcı', value: interaction.user.tag, inline: true },
                            { name: 'Kategori', value: categoryNames[category], inline: true }
                        )
                        .setTimestamp();

                    const buttons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('claim_ticket')
                                .setLabel('Destek Talebini Al')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('🙋‍♂️'),
                            new ButtonBuilder()
                                .setCustomId('close_ticket')
                                .setLabel('Talebi Kapat')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('🔒')
                        );

                    await channel.send({ embeds: [welcomeEmbed], components: [buttons] });
                    await interaction.editReply({ content: `Talebiniz oluşturuldu: <#${channel.id}>`, flags: [MessageFlags.Ephemeral] });
                }
                return;
            }

            if (interaction.isButton()) {
                if (interaction.customId === 'claim_ticket') {
                    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                    embed.addFields({ name: 'Yetkili', value: `${interaction.user} tarafından ilgileniliyor.`, inline: false });

                    const row = interaction.message.components[0];
                    const newRow = new ActionRowBuilder();

                    row.components.forEach(component => {
                        const btn = ButtonBuilder.from(component);
                        if (component.customId === 'claim_ticket') {
                            btn.setDisabled(true).setLabel('İlgileniliyor');
                        }
                        newRow.addComponents(btn);
                    });

                    // Update permissions
                    await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
                        SendMessages: true,
                        ViewChannel: true,
                        AttachFiles: true,
                        ReadMessageHistory: true
                    });

                    const newName = `claimed-${interaction.channel.name.replace('help-', '').replace('buy-', '').replace('other-', '')}`;
                    await interaction.channel.setName(newName).catch(console.error); // Ignore rate limit errors for naming

                    await interaction.update({ embeds: [embed], components: [newRow] });
                    await interaction.followUp({ content: `Destek talebi ${interaction.user} tarafından devralındı.`, ephemeral: false });
                }

                if (interaction.customId === 'close_ticket') {
                    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                        return interaction.reply({ content: 'Bu talebi kapatmak için yetkiniz yok.', flags: [MessageFlags.Ephemeral] });
                    }

                    await interaction.reply({ content: 'Destek talebi kapatılıyor ve istatistikler kaydediliyor...', flags: [MessageFlags.Ephemeral] });

                    const messages = await interaction.channel.messages.fetch({ limit: 100 });
                    const transcript = messages.reverse().map(m => `${new Date(m.createdTimestamp).toLocaleString('tr-TR')} - ${m.author.tag}: ${m.content}`).join('\n');

                    // --- STATS SAVING START ---
                    try {
                        const statsPath = path.join(__dirname, '..', 'ticket-data.json');
                        let stats = [];
                        if (fs.existsSync(statsPath)) {
                            try { stats = JSON.parse(fs.readFileSync(statsPath, 'utf8')); } catch (e) { stats = []; }
                        }

                        // Determine who claimed the ticket
                        let claimedBy = null;
                        const claimMsg = messages.find(m => m.embeds.length > 0 && m.embeds[0].fields.some(f => f.name === 'Yetkili'));
                        if (claimMsg) {
                            const field = claimMsg.embeds[0].fields.find(f => f.name === 'Yetkili');
                            // Extract ID from "<@123456> tarafından..."
                            const match = field.value.match(/<@(\d+)>/);
                            if (match) claimedBy = match[1];
                        }

                        // Determine who opened the ticket from channel topic or first message mentions if possible
                        // For now we rely on channel permission overwrites or name parsing if needed, 
                        // but simplified: we track the closer and claimer.

                        // Count messages
                        const messageCount = messages.size;

                        const ticketData = {
                            ticketId: interaction.channel.id,
                            closedBy: interaction.user.id,
                            claimedBy: claimedBy || 'Unclaimed',
                            closeTime: Date.now(),
                            openTime: interaction.channel.createdTimestamp, // Approximate
                            messageCount: messageCount
                        };

                        stats.push(ticketData);
                        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 4));

                    } catch (err) {
                        console.error('İstatistik kaydetme hatası:', err);
                    }
                    // --- STATS SAVING END ---

                    const logChannelId = client.config.ticketLogChannelId;
                    const logChannel = interaction.guild.channels.cache.get(logChannelId);

                    if (logChannel) {
                        const attachment = Buffer.from(transcript, 'utf-8');
                        const logEmbed = new EmbedBuilder()
                            .setColor('#ff4d4d')
                            .setTitle('Talebi Kapatıldı')
                            .addFields(
                                { name: 'Kanal', value: interaction.channel.name, inline: true },
                                { name: 'Kapatan', value: interaction.user.tag, inline: true },
                                { name: 'Mesaj Sayısı', value: `${messages.size}`, inline: true }
                            )
                            .setTimestamp();

                        await logChannel.send({ embeds: [logEmbed], files: [{ attachment: attachment, name: `transcript-${interaction.channel.name}.txt` }] });
                    }

                    setTimeout(() => {
                        interaction.channel.delete().catch(() => { });
                    }, 5000);
                }

                if (interaction.customId === 'upvote_suggestion' || interaction.customId === 'downvote_suggestion') {
                    const dataPath = path.join(__dirname, '..', 'suggestions_data.json');
                    let data = {};
                    if (fs.existsSync(dataPath)) {
                        try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch (e) { data = {}; }
                    }

                    if (!data[interaction.message.id]) {
                        data[interaction.message.id] = { upvotes: [], downvotes: [] };
                    }

                    const suggestion = data[interaction.message.id];
                    const userId = interaction.user.id;
                    const isUpvote = interaction.customId === 'upvote_suggestion';

                    if (isUpvote) {
                        if (suggestion.upvotes.includes(userId)) {
                            suggestion.upvotes = suggestion.upvotes.filter(id => id !== userId);
                        } else {
                            suggestion.upvotes.push(userId);
                            suggestion.downvotes = suggestion.downvotes.filter(id => id !== userId);
                        }
                    } else {
                        if (suggestion.downvotes.includes(userId)) {
                            suggestion.downvotes = suggestion.downvotes.filter(id => id !== userId);
                        } else {
                            suggestion.downvotes.push(userId);
                            suggestion.upvotes = suggestion.upvotes.filter(id => id !== userId);
                        }
                    }

                    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));

                    const oldEmbed = interaction.message.embeds[0];
                    const newEmbed = EmbedBuilder.from(oldEmbed)
                        .setFields(
                            { name: '✅ Onayla', value: `${suggestion.upvotes.length}`, inline: true },
                            { name: '❌ Reddet', value: `${suggestion.downvotes.length}`, inline: true }
                        );

                    await interaction.update({ embeds: [newEmbed] });
                }
                return;
            }

            if (!interaction.isChatInputCommand()) return;

            // Role Based Access Control (Strict)
            const config = client.config || require('../config.json');
            const authorizedRoles = (config.authorizedRoles || []).filter(id => id.length > 10 && !id.startsWith('ROL_ID'));

            const hasRole = interaction.member?.roles.cache.some(role => authorizedRoles.includes(role.id));

            // If there are restriction roles AND user doesn't have them
            if (authorizedRoles.length > 0 && !hasRole) {
                return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz. Sadece yetkili rütbeler bu botu kullanabilir.', flags: [MessageFlags.Ephemeral] }).catch(() => { });
            }

            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`${interaction.commandName} komutu bulunamadı.`);
                return;
            }

            await command.execute(interaction, client);
        } catch (error) {
            console.error(' [HATA] Interaction hatası:', error);
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Bir hata oluştu!', flags: [MessageFlags.Ephemeral] });
                } else {
                    await interaction.reply({ content: 'Bir hata oluştu!', flags: [MessageFlags.Ephemeral] });
                }
            } catch (err) {
                console.error(' [HATA] Kullanıcıya hata bildirilemedi:', err);
            }
        }
    },

};
