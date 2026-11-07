const { Client, GatewayIntentBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');

const botsData = [
  { token: "MTU2ODEwOTAx" + "ODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc", name: "اركويت", channelId: "1529477320010895370", status: "alone with the music." },
  { token: "MTU2ODEwODEw" + "MTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA", name: "بحري", channelId: "1530676107408445450", status: "Lofi & Chill Beats" },
  { token: "MTU2ODEwNjA3" + "Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8", name: "الكلاكلة", channelId: "1530673230678069309", status: "Vibing in Elara" },
  { token: "MTU2NzQ0MzUy" + "NzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY", name: "امدرمان", channelId: "1530676230335238336", status: "Gaming & Soundtracks" },
  { token: "MTU2ODEwNTc5" + "MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE", name: "شرق النيل", channelId: "1539695465568796672", status: "24/7 Music Stream" }
];

const startBot = (botInfo, index) => {
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
      console.log(`[✔] Bot ${botNum} (${botInfo.name}) is online.`);
      c.user.setPresence({
        activities: [{ name: botInfo.status, type: ActivityType.Listening }],
        status: 'online',
      });

      // الدخول التلقائي والثابت للروم
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
              group: `bot_${botNum}`
            });
            currentConnection.subscribe(player);
          }
        } catch (err) {}
      }, 4000);
    });

    // الحماية ضد الطرد أو التحريك من الروم
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
                group: `bot_${botNum}`
              });
              currentConnection.subscribe(player);
            }
          } catch (e) {}
        }, 500);
      }
    });

    // إرسال لوحة التحكم الثابتة عبر أمر !panel
    client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      const content = message.content.trim().toLowerCase();

      if (content === `!panel${botNum}` || content === '!panel') {
        const embed = new EmbedBuilder()
          .setColor(0x2f3136)
          .setTitle(`☁️ • Sudanship • Music Dashboard`)
          .setDescription(`• **مرحباً بك يا عضو Sudanship في عالم الموسيقى.**\n• البوت متواجد وثابت في روم **${botInfo.name}** 24/7.\n• اضغط على أزرار المنصات أدناه للبحث عن الأغاني وتشغيلها فوراً[span_4](start_span)[span_4](end_span):`)
          .setFooter({ text: `Sudanship • Music System` });

        // الأزرار المطلوبة (يوتيوب، سبوتفاي، قلب أبيض)
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

    // التفاعل مع الأزرار وإظهار النافذة الذكية (Modal) للبحث
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
            return await interaction.reply({ content: '⏹️ تم إيقاف الموسيقى.', ephemeral: true });
          }
        }

        // استقبال البيانات من النافذة وتشغيل الأغنية ذكياً
        if (interaction.isModalSubmit()) {
          if (interaction.customId === `search_modal_${botNum}`) {
            const query = interaction.fields.getTextInputValue('song_query');
            await interaction.reply({ content: `🔍 جاري البحث والتشغيل لـ: **${query}**...`, ephemeral: true });

            let searchResult = await play.search(query, { limit: 1 });
            if (!searchResult || searchResult.length === 0) {
              return interaction.editReply({ content: '❌ لم يتم العثور على نتائج مطابقة!' });
            }

            let stream = await play.stream(searchResult[0].url);
            let resource = createAudioResource(stream.stream, { inputType: stream.type });
            player.play(resource);

            await interaction.followUp({ content: `▶️ يتم الآن تشغيل: **${searchResult[0].title}** بواسطة بوت **${botInfo.name}**[span_5](start_span)[span_5](end_span)`, ephemeral: false });
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    client.login(botInfo.token).catch(err => {});
  }, index * 4000);
});
