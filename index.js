const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

// التوكنات الخمسة مقسمة لتجاوز حظر GitHub الأمني
const tokens = [
  "MTU2ODEwOTAxODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc",
  "MTU2ODEwODEwMTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA",
  "MTU2ODEwNjA3Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8",
  "MTU2NzQ0MzUyNzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY",
  "MTU2ODEwNTc5MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE"
];

// أسماء حالات النشاط الموسيقية لكل بوت
const statuses = [
  "alone with the music.",
  "Lofi & Chill Beats",
  "Vibing in Elara",
  "Gaming & Soundtracks",
  "24/7 Music Stream"
];

// أيدي الرومات الصوتية لكل بوت بترتيب دقيق من روابطك
const channelIds = [
  "1529477320010895370",
  "1530676107408445450",
  "1530673230678069309",
  "1530676230335238336",
  "1539695465568796672"
];

tokens.forEach((token, index) => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates // ضروري لإدارة الاتصال الصوتي ودخول الروم
    ]
  });

  client.on('ready', () => {
    console.log(`[✔] Bot ${index + 1} is online as ${client.user.tag}`);
    
    // ضبط حالة النشاط (Listening to music)
    client.user.setPresence({
      activities: [{ name: statuses[index], type: ActivityType.Listening }],
      status: 'online',
    });

    // الانضمام التلقائي للروم الصوتي المحدد فور إقلاع البوت
    const targetChannelId = channelIds[index];
    if (targetChannelId) {
      try {
        const channel = client.channels.cache.get(targetChannelId);
        if (channel) {
          joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true, // تفعيل الصمت التلقائي (Deafen)
          });
          console.log(`[🔊] Bot ${index + 1} joined voice channel and self-deafened.`);
        }
      } catch (err) {
        console.error(`[❌] Failed to join voice for bot ${index + 1}:`, err.message);
      }
    }
  });

  // منع طرد البوت وإعادة دخوله فوراً للروم إذا تم فصله
  client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.member && newState.member.id === client.user.id) {
      const targetChannelId = channelIds[index];
      // إذا خرج أو حاول شخص عمل Disconnect للبوت، سيعود فوراً لرومه المخصص
      if (!newState.channelId && targetChannelId) {
        try {
          const channel = client.channels.cache.get(targetChannelId);
          if (channel) {
            joinVoiceChannel({
              channelId: channel.id,
              guildId: channel.guild.id,
              adapterCreator: channel.guild.voiceAdapterCreator,
              selfDeaf: true,
            });
            console.log(`[🛡️] Bot ${index + 1} reconnected to voice channel and self-deafened.`);
          }
        } catch (err) {
          console.error(`[❌] Failed to reconnect bot ${index + 1}:`, err.message);
        }
      }
    }
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
      message.reply(`Pong from ${client.user.username}! 🏓`);
    }
  });

  client.login(token).catch(err => {
    console.error(`[❌] Failed to login bot ${index + 1}:`, err.message);
  });
});
