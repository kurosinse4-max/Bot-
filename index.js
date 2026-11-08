const { Client, GatewayIntentBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
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
      } catch (err) {
        console.error(`Voice connection error on bot ${botNum}:`, err);
      }
    };

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
        const embed = new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle(`• Sudanship • Music [Bot ${botNum}]`)
          .setDescription(`• مرحباً بك يا عضو Sudanship\n• اكتب اسم أو رابط الأغنية\n• أو اضغط زر المنصة اللي تبيها من تحت`)
          .setFooter({ text: `Sudanship • Music Dashboard` });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`yt_modal_${botNum}`).setStyle(ButtonStyle.Secondary).setEmoji('▶️').setLabel('YouTube'),
          new ButtonBuilder().setCustomId(`spotify_modal_${botNum}`).setStyle(ButtonStyle.Secondary).setEmoji('🟢').setLabel('Spotify'),
          new ButtonBuilder().setCustomId(`sc_modal_${botNum}`).setStyle(ButtonStyle.Secondary).setEmoji('🟠').setLabel('SoundCloud'),
          new ButtonBuilder().setCustomId(`fav_btn_${botNum}`).setStyle(ButtonStyle.Secondary).setEmoji('🤍')
        );

        return message.reply({ embeds: [embed], components: [row] });
      }
    });

    client.on(Events.InteractionCreate, async (interaction) => {
      try {
        if (interaction.isButton()) {
          if (['yt_modal_', 'spotify_modal_', 'sc_modal_'].some(id => interaction.customId.startsWith(id))) {
            const modal = new ModalBuilder()
              .setCustomId(`search_modal_${botNum}`)
              .setTitle(`Sudanship - محرك البحث الذكي`);

            const songInput = new TextInputBuilder()
              .setCustomId('song_query')
              .setLabel('Song name or URL')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('اكتب اسم الأغنية أو الرابط هنا...')
              .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(songInput));
            return await interaction.showModal(modal);
          }

          if (interaction.customId === `fav_btn_${botNum}`) {
            return await interaction.reply({ content: '🤍 تمت إضافة الأغنية إلى المفضلة!', ephemeral: true });
          }

          if (interaction.customId === `stop_btn_${botNum}`) {
            player.stop();
            try {
              const channel = await client.channels.fetch(botInfo.channelId);
              if (channel) connectToVoice(channel, false);
            } catch (e) {}
            return await interaction.reply({ content: '⏹️ تم إيقاف الموسيقى وإعادة البوت لوضعه الثابت.', ephemeral: true });
          }
        }

        if (interaction.isModalSubmit()) {
          if (interaction.customId === `search_modal_${botNum}`) {
            const query = interaction.fields.getTextInputValue('song_query');
            await interaction.reply({ content: `🔍 جاري جلب الأغنية وبث الصوت في الفويس لـ: **${query}**...`, ephemeral: true });

            let searchResults = await play.search(query, { limit: 1 });
            if (!searchResults || searchResults.length === 0) {
              return interaction.editReply({ content: '❌ لم يتم العثور على نتائج مطابقة!' });
            }

            let song = searchResults[0];

            // فك الصمت وفعل الاتصال فور بدء تشغيل الصوت
            try {
              const channel = await client.channels.fetch(botInfo.channelId);
              if (channel) connectToVoice(channel, true);
            } catch (e) {}

            // جلب الستريم الحقيقي بصيغة تدعم الصوت بوضوح
            let stream = await play.stream(song.url);
            let resource = createAudioResource(stream.stream, { 
              inputType: stream.type,
              inlineVolume: true 
            });
            resource.volume.setVolume(0.8); // ضبط مستوى الصوت 80%

            player.play(resource);

            const playingEmbed = new EmbedBuilder()
              .setColor(0x2B2D31)
              .setTitle(`▶️ • يُشغّل الآن في الفويس`)
              .setDescription(`**[${song.title}](${song.url})**\n\n🎙️ **الفنان:** ${song.channel?.name || 'Sudanship'}\n\n⚪ــــــــــــــــــــــــــــ 00:00 / ${song.duration || '03:00'}\n\n🔊 **مستوى الصوت:** 80%\n🔂 **وضع التكرار:** لا\n🔀 **ميزة نفس الجو:** معطل\n📋 **طابور الانتظار:** 0 أغانٍ`)
              .setImage(song.thumbnails[0]?.url || 'https://i.imgur.com/3g7X7Q8.png')
              .setFooter({ text: `Playing by: @${interaction.user.tag}` });

            const controlRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`stop_btn_${botNum}`).setStyle(ButtonStyle.Danger).setEmoji('⏹️'),
              new ButtonBuilder().setCustomId(`fav_btn_${botNum}`).setStyle(ButtonStyle.Secondary).setEmoji('🤍')
            );

            await interaction.followUp({ embeds: [playingEmbed], components: [controlRow], ephemeral: false });
          }
        }
      } catch (err) {
        console.error("Interaction error:", err);
      }
    });

    client.login(botInfo.token).catch(err => {});
  }, index * 4000);
});
