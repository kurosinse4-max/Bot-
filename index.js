const { Client, GatewayIntentBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

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
            joinVoiceChannel({
              channelId: channel.id,
              guildId: channel.guild.id,
              adapterCreator: channel.guild.voiceAdapterCreator,
              selfDeaf: true,
              selfMute: false,
              group: `bot_${botNum}`
            });
            console.log(`[🔊] Bot ${botNum} (${botInfo.name}) joined voice.`);
          }
        } catch (err) {
          console.error(`[❌] Voice join error for bot ${botNum}:`, err.message);
        }
      }, 4000);
    });

    client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      if (newState.member?.id === client.user.id && !newState.channelId) {
        setTimeout(async () => {
          try {
            const channel = await client.channels.fetch(botInfo.channelId);
            if (channel) {
              joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false,
                group: `bot_${botNum}`
              });
            }
          } catch (e) {}
        }, 500);
      }
    });

    client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;

      const content = message.content.trim().toLowerCase();

      if (content === `!panel${botNum}` || content === '!panel') {
        const embed = new EmbedBuilder()
          .setColor(0x2f3136)
          .setTitle(`🎶 • ${botInfo.name} • Music Dashboard`)
          .setDescription(`• أهلاً بك يا مهند في لوحة تحكم **${botInfo.name}** الثابتة.\n• البوت متواجد في رومته ومحمي 24/7.`)
          .addFields(
            { name: 'حالة البوت', value: '🟢 متصل وثابت في الروم الصوتي', inline: true },
            { name: 'الأمان', value: '🛡️ مفعل (ممنوع الطرد)', inline: true }
          )
          .setFooter({ text: `Elara • Music System` });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`status_btn_${botNum}`)
            .setLabel('حالة البوت')
            .setStyle(ButtonStyle.Success)
            .setEmoji('⚡'),
          new ButtonBuilder()
            .setCustomId(`ping_btn_${botNum}`)
            .setLabel('سرعة الاستجابة')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🏓')
        );

        return message.reply({ embeds: [embed], components: [row] });
      }
    });

    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isButton()) return;

      if (interaction.customId === `status_btn_${botNum}`) {
        await interaction.reply({ content: `✅ بوت **${botInfo.name}** شغال 100% وثابت في رومته الصوتي وجاهز!`, ephemeral: true });
      }

      if (interaction.customId === `ping_btn_${botNum}`) {
        const ping = client.ws.ping;
        await interaction.reply({ content: `🏓 سرعة استجابة بوت **${botInfo.name}** هي: \`${ping}ms\``, ephemeral: true });
      }
    });

    client.login(botInfo.token).catch(err => {
      console.error(`[❌] Bot ${botNum} login failed:`, err.message);
    });
  }, index * 5000);
};

botsData.forEach((bot, idx) => startBot(bot, idx));
