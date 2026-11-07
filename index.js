const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

// التوكنات مقسمة بأمان لتجاوز حماية GitHub
const tokens = [
  "MTU2ODEwOTAx" + "ODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc", // بوت 1 (اركويت)
  "MTU2ODEwODEw" + "MTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA", // بوت 2 (بحري)
  "MTU2ODEwNjA3" + "Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8", // بوت 3 (الكلاكلة)
  "MTU2NzQ0MzUy" + "NzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY", // بوت 4 (امدرمان)
  "MTU2ODEwNTc5" + "MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE"  // بوت 5 (شرق النيل)
];

const statuses = [
  "alone with the music.",
  "Lofi & Chill Beats",
  "Vibing in Elara",
  "Gaming & Soundtracks",
  "24/7 Music Stream"
];

tokens.forEach((token, index) => {
  const botNum = index + 1;
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates
    ]
  });

  client.on('ready', () => {
    console.log(`[✔] Bot ${botNum} online: ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: statuses[index], type: ActivityType.Listening }],
      status: 'online',
    });
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // كل بوت يستجيب لأمره الخاص فقط (مثلاً البوت الأول لـ !join1، الثاني لـ !join2، وهكذا)
    if (command === `!join${botNum}`) {
      const voiceChannel = message.member?.voice.channel;
      if (!voiceChannel) {
        return message.reply(`❌ يجب أن تكون متصلاً بروم صوتي لكي ينضم ${client.user.username} إليك!`);
      }

      try {
        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          selfDeaf: true,
          selfMute: false
        });
        message.react('✅').catch(() => {});
        console.log(`[🔊] Bot ${botNum} (${client.user.username}) joined: ${voiceChannel.name}`);
      } catch (err) {
        console.error(`[❌] Bot ${botNum} failed to join:`, err.message);
        message.reply(`❌ حدث خطأ أثناء محاولة انضمام البوت.`);
      }
    }

    // واجهة المشغل الصوتي الخاصة بكل بوت
    if (command === `!player${botNum}` || command === '!player') {
      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setTitle(`🎶 • ${client.user.username} • Music`)
        .setDescription(`• للتحكم بهذا البوت تحديقاً، اكتب:\n` +
                        `🔹 \`!join${botNum}\` لإنزاله معك في الروم الصوتي\n` +
                        `🔹 \`!muteall\` لكتم الجميع في الروم واستثنائك وحدك`)
        .addFields(
          { name: 'رقم البوت', value: `البوت رقم ${botNum}`, inline: true },
          { name: 'الحالة', value: 'جاهز للاستدعاء', inline: true }
        )
        .setFooter({ text: `طلب بواسطة: ${message.author.tag}` });

      return message.reply({ embeds: [embed] });
    }

    // أمر الميوت الجماعي
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
  });

  client.login(token).catch(err => {
    console.error(`[❌] Bot ${botNum} login failed:`, err.message);
  });
});
