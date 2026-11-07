const { Client, GatewayIntentBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
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
            currentConnection = joinVoiceChannel({
              channelId: channel.id,
              guildId: channel.guild.id,
              adapterCreator: channel.guild.voiceAdapterCreator,
              selfDeaf: true,
              selfMute: false,
              group: `sudanship_${botNum}`
            });
            currentConnection.subscribe(player);
          }
        } catch (err) {}
      }, 4000);
    });

    // حماية تامة ضد الطرد أو التحريك
    client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      if (newState.member?.id === client.user.id && !newState.channelId) {
        setTimeout(async () => {
          try {
            const channel = await client.channels.fetch(botInfo.channelId);
            if (channel) {
              currentConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false,
                group: `sudanship_${botNum}`
              });
              currentConnection.subscribe(player);
            }
          } catch (e) {}
        }, 500);
      }
    });

    // إرسال لوحة التحكم الفخمة
    client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      const content = message.content.trim().toLowerCase();

      if (content === `!panel${botNum}` || content === '!panel') {
        const embed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setTitle(`☁️ • Sudanship • Music Dashboard`)
          .setDescription(`• **مرحباً بك يا عضو Sudanship في عالم الموسيقى.**\n• البوت ذكي ومتواجد وثابت في الروم الصوتي 24/7.\n• اضغط على أزرار المنصات أدناه للبحث عن الأغاني وتشغيلها فوراً:`)
          .setFooter({ text: `Sudanship • Ultimate Music Experience` });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`yt_modal_${botNum}`)
            .setLabel('YouTube')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('▶️'),
          new ButtonBuilder()
            .setCustomId(`spotify_modal_${botNum}`)
            .setLabel('Spotify')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🟢'),
          new ButtonBuilder()
            .setCustomId(`fav_btn_${botNum}`)
            .setLabel('المفضلة')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🤍'),
          new ButtonBuilder()
            .setCustomId(`stop_music_${botNum}`)
            .setLabel('إيقاف')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('⏹️')
        );

        return message.reply({ embeds: [embed], components: [row] });
      }
    });

    // التفاعل مع الأزرار والنوافذ وتشغيل الصوت الحقيقي مع صورة الأغنية
    client.on(Events.InteractionCreate, async (interaction) => {
      try {
        if (interaction.isButton()) {
          if (interaction.customId === `yt_modal_${botNum}` || interaction.customId === `spotify_modal_${botNum}`) {
            const modal = new ModalBuilder()
              .setCustomId(`search_modal_${botNum}`)
              .setTitle(`Sudanship - تشغيل الأغاني`);

            const songInput = new TextInputBuilder()
              .setCustomId('song_query')
              .setLabel('اكتب اسم الأغنية أو رابط يوتيوب')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Song name or https://youtu.be/...')
              .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(songInput));
            return await interaction.showModal(modal);
          }

          if (interaction.customId === `fav_btn_${botNum}`) {
            return await interaction.reply({ content: '🤍 قائمة المفضلة فارغة حالياً.', ephemeral: true });
          }

          if (interaction.customId === `stop_music_${botNum}`) {
            player.stop();
            return await interaction.reply({ content: '⏹️ تم إيقاف الموسيقى وإفراغ المشغل.', ephemeral: true });
          }
        }

        if (interaction.isModalSubmit()) {
          if (interaction.customId === `search_modal_${botNum}`) {
            const query = interaction.fields.getTextInputValue('song_query');
            await interaction.reply({ content: `🔍 جاري البحث والتشغيل الذكي لـ: **${query}**...`, ephemeral: true });

            // البحث الذكي وجلب معلومات الأغنية وصورتها
            let searchResults = await play.search(query, { limit: 1 });
            if (!searchResults || searchResults.length === 0) {
              return interaction.editReply({ content: '❌ لم يتم العثور على نتائج مطابقة!' });
            }

            let song = searchResults[0];
            let stream = await play.stream(song.url);
            let resource = createAudioResource(stream.stream, { inputType: stream.type });
            
            player.play(resource);

            // لوحة عرض الأغنية الحالية مع الصورة والزر الفخم
            const playingEmbed = new EmbedBuilder()
              .setColor(0xFFA500)
              .setTitle(`🎵 • جاري يُشغّل الآن`)
              .setDescription(`**[${song.title}](${song.url})**\n\n• **القناة / الفنان:** ${song.channel?.name || 'Unknown'}\n• **المدة:** ${song.duration || 'Live'}`)
              .setImage(song.thumbnails[0]?.url || 'https://i.imgur.com/3g7X7Q8.png')
              .setFooter({ text: `Sudanship • Requested by ${interaction.user.tag}` });

            const controlRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`stop_music_${botNum}`)
                .setLabel('إيقاف')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('⏹️')
            );

            await interaction.followUp({ embeds: [playingEmbed], components: [controlRow], ephemeral: false });
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    client.login(botInfo.token).catch(err => {});
  }, index * 4000);
});
