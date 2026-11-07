const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

const tokens = [
  "MTU2ODEwOTAxODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc",
  "MTU2ODEwODEwMTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA",
  "MTU2ODEwNjA3Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8",
  "MTU2NzQ0MzUyNzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY",
  "MTU2ODEwNTc5MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE"
];

const channelIds = [
  "1529477320010895370", // بوت 1 (اركويت)
  "1530676107408445450", // بوت 2 (بحري)
  "1530673230678069309", // بوت 3 (الكلاكلة)
  "1530676230335238336", // بوت 4 (امدرمان)
  "1539695465568796672"  // بوت 5 (شرق النيل)
];

const statuses = [
  "alone with the music.",
  "Lofi & Chill Beats",
  "Vibing in Elara",
  "Gaming & Soundtracks",
  "24/7 Music Stream"
];

tokens.forEach((token, index) => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates
    ]
  });

  client.on('ready', async () => {
    console.log(`[✔] Bot ${index + 1} is online as ${client.user.tag}`);
    
    client.user.setPresence({
      activities: [{ name: statuses[index], type: ActivityType.Listening }],
      status: 'online',
    });

    const channelId = channelIds[index];
    if (!channelId) return;

    try {
      const channel = await client.channels.fetch(channelId);
      if (channel && channel.isVoiceBased()) {
        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfDeaf: true,
          selfMute: false
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
          try {
            await Promise.race([
              entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
              entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
          } catch (error) {
            connection.destroy();
            setTimeout(() => {
              joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: true,
              });
            }, 3_000);
          }
        });

        console.log(`[🔊] Bot ${index + 1} joined voice channel: ${channel.name}`);
      }
    } catch (err) {
      console.error(`[❌] Bot ${index + 1} failed to join voice channel:`, err.message);
    }
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // واجهة تظهر شكل الـ Player الاحترافي عند الطلب
    if (message.content === '!player' || message.content === '!music') {
      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setTitle(`🎶 • ${client.user.username} • Music`)
        .setDescription('• اكتب اسم أو رابط الأغنية\n• أو اضغط زر المنصة اللي تبيها من تحت')
        .addFields(
          { name: 'المصدر', value: 'Spotify / YouTube', inline: true },
          { name: 'الصوت', value: '80%', inline: true },
          { name: 'التكرار', value: 'OFF', inline: true }
        )
        .setFooter({ text: `طلب بواسطة: ${message.author.tag}` });

      return message.reply({ embeds: [embed] });
    }

    // أمر الميوت الجماعي الفوري للأعضاء في الروم ما عدا المرسل
    if (message.content === '!muteall') {
      const memberChannel = message.member.voice.channel;
      if (!memberChannel) {
        return message.reply('❌ يجب أن تكون متصلاً بروم صوتي لتنفيذ هذا الأمر!');
      }

      try {
        let mutedCount = 0;
        for (const [memberId, member] of memberChannel.members) {
          if (memberId !== message.author.id && !member.user.bot) {
            await member.voice.setMute(true, 'Requested by ' + message.author.tag);
            mutedCount++;
          }
        }
        message.reply(`[🔇] تم عمل ميوت لـ ${mutedCount} أعضاء في الروم بنجاح، وتم استثنائك أنت وحدك!`);
      } catch (err) {
        console.error('Failed to mute members:', err);
        message.reply('❌ حدث خطأ أثناء محاولة كتم الأعضاء. تأكد من أن لدى البوت صلاحية Mute Members.');
      }
    }

    if (message.content === '!ping') {
      message.reply(`Pong from ${client.user.username}! 🏓`);
    }
  });

  client.login(token).catch(err => {
    console.error(`[❌] Failed to login bot ${index + 1}:`, err.message);
  });
});
