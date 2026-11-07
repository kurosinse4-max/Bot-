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
            console.log(`[🔊] Bot ${botNum} (${botInfo.name}) joined voice.`);
          }
        } catch (err) {
          console.error(`[❌] Voice join error for bot ${botNum}:`, err.message);
        }
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

    // إرسال لوحة التحكم عبر أمر !panel
    client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;

      if (message.content.trim() === `!panel${botNum}` || message.content.trim() === '!panel') {
        const embed = new EmbedBuilder()
          .setColor(0x2f3136)
          .setTitle(`🎶 • ${botInfo.name} • Music Dashboard`)
          .setDescription(`• أهلاً بك يا مهند في لوحة تحكم **${botInfo.name}**.\n• اضغط على الزر أدناه لتشغيل الأغاني:`)
          .setFooter({ text: `Elara • Music System` });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`open_modal_${botNum}`)
            .setLabel('بحث أو تشغيل يوتيوب')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎵'),
          new ButtonBuilder()
            .setCustomId(`stop_music_${botNum}`)
            .setLabel('إيقاف')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('⏹️')
        );

        return message.reply({ embeds: [embed], components: [row] });
      }
    });

    // تفاعل الأزرار والنوافذ
    client.on(Events.InteractionCreate, async (interaction) => {
      try {
        if (interaction.isButton()) {
          if (interaction.customId === `open_modal_${botNum}`) {
            const modal = new ModalBuilder()
              .setCustomId(`music_modal_${botNum}`)
              .setTitle(`${botInfo.name} - YouTube Player`);

            const songInput = new TextInputBuilder()
              .setCustomId('song_query')
              .setLabel('اسم الأغنية أو رابط يوتيوب')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('اكتب اسم الأغنية هنا...')
              .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(songInput));
            return await interaction.showModal(modal);
          }

          if (interaction.customId === `stop_music_${botNum}`) {
            player.stop();
            return await interaction.reply({ content: '⏹️ تم إيقاف الموسيقى.', ephemeral: true });
          }
        }

        if (interaction.isModalSubmit()) {
          if (interaction.customId === `music_modal_${botNum}`) {
            const query = interaction.fields.getTextInputValue('song_query');
            await interaction.reply({ content: `🔍 جاري البحث والتشغيل لـ: **${query}**...`, ephemeral: true });

            let streamData = await play.search(query, { limit: 1 });
            if (!streamData || streamData.length === 0) {
              return interaction.editReply({ content: '❌ لم يتم العثور على نتائج!' });
            }

            let stream = await play.stream(streamData[0].url);
            let resource = createAudioResource(stream.stream, { inputType: stream.type });
            player.play(resource);

            await interaction.followUp({ content: `▶️ يتم الآن تشغيل: **${streamData[0].title}**`, ephemeral: false });
          }
        }
      } catch (err) {
        console.error('Interaction Error:', err);
      }
    });

    client.login(botInfo.token).catch(err => {
      console.error(`[❌] Bot ${botNum} login failed:`, err.message);
    });
  }, index * 5000);
};

botsData.forEach((bot, idx) => startBot(bot, idx));
