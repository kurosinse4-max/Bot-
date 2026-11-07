const { Client, GatewayIntentBits, ActivityType, Events } = require('discord.js');
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
      console.log(`[✔] Bot ${botNum} (${botInfo.name}) is online as ${c.user.tag}`);
      c.user.setPresence({
        activities: [{ name: botInfo.status, type: ActivityType.Listening }],
        status: 'online',
      });

      // الدخول التلقائي والثابت للروم الخاص بكل بوت
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
            console.log(`[🔊] Bot ${botNum} (${botInfo.name}) locked into room: ${channel.name}`);
          }
        } catch (err) {
          console.error(`[❌] Bot ${botNum} voice join error:`, err.message);
        }
      }, 4000);
    });

    // حماية صارمة ضد الطرد: لو أي شخص حاول يخرج البوت، يعود فوراً مكانه
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

    client.login(botInfo.token).catch(err => {
      console.error(`[❌] Bot ${botNum} login failed:`, err.message);
    });
  }, index * 5000);
};

botsData.forEach((bot, idx) => startBot(bot, idx));
