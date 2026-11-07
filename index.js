const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YouTubePlugin } = require('@distube/youtube-dl');
const { joinVoiceChannel } = require('@discordjs/voice');

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

  // إعداد مشغل الموسيقى DisTube مع دعم يوتيوب وسبوتفاي
  const distube = new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnFinish: false,
    leaveOnStop: false,
    plugins: [
      new SpotifyPlugin(),
      new YouTubePlugin()
    ]
  });

  // إرسال واجهة الأغنية الحالية عند تشغيلها في الروم
  distube.on('playSong', (queue, song) => {
    const embed = new EmbedBuilder()
      .setColor(0x1db954)
      .setTitle('🎶 • جاري يُشغل الآن')
      .setDescription(`**[${song.name}](${song.url})**`)
      .addFields(
        { name: '🎤 الفنان', value: song.uploader.name || 'غير معروف', inline: true },
        { name: '⏱️ المدة', value: song.formattedDuration, inline: true },
        { name: '🎧 الصوت', value: '100%', inline: true }
      )
      .setFooter({ text: `طلب بواسطة: ${song.user.tag}` });

    queue.textChannel?.send({ embeds: [embed] }).catch(() => {});
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
        joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfDeaf: true,
          selfMute: false
        });
        console.log(`[🔊] Bot ${index + 1} joined voice channel: ${channel.name}`);
      }
    } catch (err) {
      console.error(`[❌] Bot ${index + 1} failed to join voice channel:`, err.message);
    }
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // أمر التشغيل: !play اسم الأغنية أو الرابط
    if (command === '!play' || command === '!p') {
      const voiceChannel = message.member?.voice.channel;
      if (!voiceChannel) {
        return message.reply('❌ يجب أن تكون متصلاً بروم صوتي لتشغيل الأغاني!');
      }
      const query = args.join(' ');
      if (!query) {
        return message.reply('❌ ارفق اسم الأغنية أو رابط يوتيوب/سبوتفاي بعد الأمر!');
      }

      try {
        await distube.play(voiceChannel, query, {
          textChannel: message.channel,
          member: message.member,
        });
        message.react('✅').catch(() => {});
      } catch (e) {
        console.error(e);
        message.reply(`❌ حدث خطأ أثناء تشغيل الأغنية: ${e.message}`);
      }
    }

    // أمر إيقاف مؤقت: !pause
    if (command === '!pause') {
      try {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) return message.reply('❌ لا توجد أغنية تعمل حالياً!');
        queue.pause();
        message.reply('⏸️ تم إيقاف الأغنية مؤقتاً.');
      } catch (e) {
        message.reply('❌ حدث خطأ أثناء إيقاف الأغنية.');
      }
    }

    // أمر استئناف التشغيل: !resume
    if (command === '!resume') {
      try {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) return message.reply('❌ لا توجد أغنية في الطابور!');
        queue.resume();
        message.reply('▶️ تم استئناف تشغيل الأغنية.');
      } catch (e) {
        message.reply('❌ حدث خطأ أثناء استئناف التشغيل.');
      }
    }

    // أمر تخطي الأغنية: !skip
    if (command === '!skip') {
      try {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) return message.reply('❌ لا توجد أغاني في الطابور للتخطي!');
        const song = await queue.skip();
        message.reply(`⏭️ تم تخطي الأغنية. التشغيل الآن: **${song.name}**`);
      } catch (e) {
        message.reply('❌ لا توجد أغاني أخرى في الطابور.');
      }
    }

    // أمر الميوت الجماعي للأعضاء في الروم ما عدا المرسل
    if (command === '!muteall') {
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
        message.reply('❌ حدث خطأ أثناء محاولة كتم الأعضاء.');
      }
    }

    if (command === '!ping') {
      message.reply(`Pong from ${client.user.username}! 🏓`);
    }
  });

  client.login(token).catch(err => {
    console.error(`[❌] Failed to login bot ${index + 1}:`, err.message);
  });
});
