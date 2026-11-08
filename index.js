const { Client, GatewayIntentBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');

const botsData = [
  { token: "MTU2ODEwOTAx" + "ODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc", channelId: "1529477320010895370", status: "Sudanship Music 24/7" },
  { token: "MTU2ODEwODEw" + "MTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA", channelId: "1530676107408445450", status: "Sudanship Vibes" },
  { token: "MTU2ODEwNjA3" + "Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8", channelId: "1530673230678069309", status: "Sudanship Beats" },
  { token: "MTU2NzQ0MzUy" + "NzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY", channelId: "1530676230335238336", status: "Sudanship Chill" },
  { token: "MTU2ODEwNTc5" + "MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE", channelId: "1539695465568796672", status: "Sudanship Stream" }
];

botsData.forEach((botInfo, index) => {
  const botNum = index + 1;

  setTimeout(() => {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
      ]
    });

    let currentConnection = null;
    const player = createAudioPlayer();
    let activePanelMessage = null;

    const connectToVoice = (channel, isPlaying = false) => {
      try {
        currentConnection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfDeaf: !isPlaying,
          selfMute: false,
          group: `sudanship_${botNum}`
        });
        currentConnection.subscribe(player);
      } catch (err) {}
    };

    player.on(AudioPlayerStatus.Idle, async () => {
      try {
        const channel = await client.channels.fetch(botInfo.channelId);
        if (channel) connectToVoice(channel, false);
      } catch (e) {}
    });

    client.once(Events.ClientReady, async (c) => {
      console.log(`[✔] Sudanship Bot ${botNum} is online.`);
      c.user.setPresence({
        activities: [{ name: botInfo.status, type: ActivityType.Listening }],
        status: 'online',
      });

      setTimeout(async () => {
        try {
          const channel = await c.channels.fetch(botInfo.channelId);
          if (channel && channel.isVoiceBased()) {
            connectToVoice(channel, false);
          }
        } catch (err) {}
      }, 4000);
    });

    client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      if (newState.member?.id === client.user.id && !newState.channelId) {
        setTimeout(async () => {
          try {
            const channel = await client.channels.fetch(botInfo.channelId);
            if (channel) connectToVoice(channel, false);
          } catch (e) {}
        }, 500);
      }
    });

    client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      const content = message.content.trim().toLowerCase();

      if (content === `!panel${botNum}` || (botNum === 1 && content === '!panel')) {
        if (activePanelMessage) {
          try { await activePanelMessage.delete(); } catch (e) {}
        }

        const embed = new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`• Sudanship • Music Dashboard [Bot ${botNum}]`)
          .setDescription(`• مرحباً بك يا عضو Sudanship\n• انقر على زر **محرك بحث Sudanship** لاختيار وتشغيل الأغنية فوراً[span_1](start_span)[span_1](end_span):`)
          .setFooter({ text: `Sudanship • Professional System (Auto-Refresh)` });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`search_modal_btn_${botNum}`).setStyle(ButtonStyle.Primary).setEmoji('🔍').setLabel('محرك بحث Sudanship'),
          new ButtonBuilder().setCustomId(`stop_btn_${botNum}`).setStyle(ButtonStyle.Danger).setEmoji('⏹️').setLabel('إيقاف')
        );

        activePanelMessage = await message.reply({ embeds: [embed], components: [row] });

        setInterval(async () => {
          try {
            if (activePanelMessage) {
              await activePanelMessage.delete().catch(() => {});
            }
            activePanelMessage = await message.channel.send({ embeds: [embed], components: [row] });
          } catch (err) {}
        }, 180000);
      }
    });

    client.on(Events.InteractionCreate, async (interaction) => {
      try {
        if (interaction.isButton()) {
          if (interaction.customId === `search_modal_btn_${botNum}`) {
            const modal = new ModalBuilder()
              .setCustomId(`search_input_modal_${botNum}`)
              .setTitle(`محرك بحث Sudanship الذكي`);

            const songInput = new TextInputBuilder()
              .setCustomId('query_text')
              .setLabel('اكتب اسم الأغنية هنا للبحث الفوري')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('مثال: Soulja أو Rema...')
              .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(songInput));
            return await interaction.showModal(modal);
          }

          if (interaction.customId === `stop_btn_${botNum}`) {
            player.stop();
            try {
              const channel = await client.channels.fetch(botInfo.channelId);
              if (channel) connectToVoice(channel, false);
            } catch (e) {}
            return await interaction.update({ content: '⏹️ تم إيقاف الموسيقى وإعادة البوت لوضعه الصامت.', embeds: [], components: [] });
          }
        }

        if (interaction.isModalSubmit()) {
          if (interaction.customId === `search_input_modal_${botNum}`) {
            // رد مؤقت سريع جداً عشان نتفادى التعليق (is thinking)
            await interaction.deferReply({ ephemeral: true });
            
            const query = interaction.fields.getTextInputValue('query_text');

            let searchResults;
            try {
              searchResults = await play.search(query, { limit: 5 });
            } catch (e) {
              return interaction.editReply({ content: '❌ حدث خطأ في الاتصال بمحرك البحث، حاول مرة أخرى.' });
            }

            if (!searchResults || searchResults.length === 0) {
              return interaction.editReply({ content: '❌ لم يتم العثور على نتائج مطابقة!' });
            }

            const embed = new EmbedBuilder()
              .setColor(0x2B2D31)
              .setTitle(`Search Results for: ${query}`)
              .setDescription(searchResults.map((song, i) => `${i + 1}. **${song.title}** - By ${song.channel?.name || 'Unknown'}`).join('\n'))
              .setFooter({ text: `حدد مقطوعة للتشغيل من القائمة أدناه` });

            const options = searchResults.map((song, i) => ({
              label: song.title.substring(0, 99),
              description: `By ${song.channel?.name || 'Unknown'} (${song.duration || 'Live'})`.substring(0, 99),
              value: `play_idx_${i}_${botNum}`
            }));

            const selectMenu = new StringSelectMenuBuilder()
              .setCustomId(`select_song_menu_${botNum}`)
              .setPlaceholder('حدد مقطوعة للتشغيل...')
              .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            client.cachedSearchResults = searchResults;

            return interaction.editReply({ content: null, embeds: [embed], components: [row] });
          }
        }

        if (interaction.isStringSelectMenu()) {
          if (interaction.customId === `select_song_menu_${botNum}`) {
            const selectedValue = interaction.values[0];
            const indexMatch = selectedValue.split('_')[2];
            const song = client.cachedSearchResults?.[indexMatch];

            if (!song) {
              return interaction.reply({ content: '❌ انتهت صلاحية البحث، يرجى البحث مرة أخرى.', ephemeral: true });
            }

            await interaction.update({ content: `🎵 جاري تشغيل: **${song.title}** وبث الصوت في الفويس...`, embeds: [], components: [] });

            try {
              const channel = await client.channels.fetch(botInfo.channelId);
              if (channel) connectToVoice(channel, true);
            } catch (e) {}

            let stream = await play.stream(song.url);
            let resource = createAudioResource(stream.stream, { 
              inputType: stream.type,
              inlineVolume: true 
            });
            resource.volume.setVolume(1.0);

            player.play(resource);

            const playingEmbed = new EmbedBuilder()
              .setColor(0x2B2D31)
              .setTitle(`▶️ • يُشغّل الآن في الفويس`)
              .setDescription(`**[${song.title}](${song.url})**\n\n🎙️ **الفنان:** ${song.channel?.name || 'Sudanship'}\n\n🔊 **مستوى الصوت:** 100%`)
              .setImage(song.thumbnails[0]?.url || 'https://i.imgur.com/3g7X7Q8.png')
              .setFooter({ text: `Playing by: @${interaction.user.tag}` });

            const controlRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`stop_btn_${botNum}`).setStyle(ButtonStyle.Danger).setEmoji('⏹️').setLabel('إيقاف'),
              new ButtonBuilder().setCustomId(`fav_btn_${botNum}`).setStyle(ButtonStyle.Secondary).setEmoji('🤍').setLabel('مفضلة')
            );

            await interaction.channel.send({ embeds: [playingEmbed], components: [controlRow] });
          }
        }
      } catch (err) {
        console.error("Interaction error:", err);
      }
    });

    client.login(botInfo.token).catch(err => {});
  }, index * 4000);
});
