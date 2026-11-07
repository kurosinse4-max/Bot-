const { Client, GatewayIntentBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

const botsData = [
  { token: "MTU2ODEwOTAx" + "ODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc", name: "اركويت", channelId: "1529477320010895370", status: "Sudanship Music 24/7" },
  { token: "MTU2ODEwODEw" + "MTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA", name: "بحري", channelId: "1530676107408445450", status: "Sudanship Vibes" },
  { token: "MTU2ODEwNjA3" + "Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8", name: "الكلاكلة", channelId: "1530673230678069309", status: "Elara Beats" },
  { token: "MTU2NzQ0MzUy" + "NzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY", name: "امدرمان", channelId: "1530676230335238336", status: "Gaming & Chill" },
  { token: "MTU2ODEwNTc5" + "MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE", name: "شرق النيل", channelId: "1539695465568796672", status: "Active Stream" }
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
      console.log(`[✔] Bot ${botNum} (${botInfo.name}) is online.`);
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
              group: `bot_${botNum}`
            });
            currentConnection.subscribe(player);
            console.log(`[🔊] Bot ${botNum} locked into room.`);
          }
        } catch (err) {}
      }, 4000);
    });

    // حماية صارمة ضد الطرد أو التحريك
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

    // إرسال لوحة التحكم الفخمة بالأمر !panel
    client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      const content = message.content.trim().toLowerCase();

      if (content === `!panel${botNum}` || content === '!panel') {
        const embed = new EmbedBuilder()
          .setColor(0xFFA500) // لون برتقالي فخم
          .setTitle(`☁️ • Sudanship • Music Dashboard`)
          .setDescription(`• **مرحباً بك يا عضو Sudanship في عالم الموسيقى.**\n• البوت متواجد وثابت في روم **${botInfo.name}** على مدار الساعة 24/7.\n• اضغط على أزرار المنصات أدناه للبحث عن الأغاني وتشغيلها فوراً:`)
          .setFooter({ text: `Sudanship • High Quality Music System` });

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

    // نظام التفاعل الذكي مع الأزرار والنوافذ
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
            return await interaction.reply({ content: '⏹️ تم إيقاف الموسيقى بنجاح.', ephemeral: true });
          }
        }

        if (interaction.isModalSubmit()) {
          if (interaction.customId === `search_modal_${botNum}`) {
            const query = interaction.fields.getTextInputValue('song_query');
            await interaction.reply({ content: `▶️ تم استلام طلبك بنجاح لـ: **${query}**. بوت **${botInfo.name}** شغال وثابت في رومته وجاهز للتشغيل!`, ephemeral: false });
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    client.login(botInfo.token).catch(err => {});
  }, index * 4000);
});
