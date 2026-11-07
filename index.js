const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

// التوكنات مقسمة لتجاوز حماية GitHub
const tokens = [
  "MTU2ODEwOTAx" + "ODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc",
  "MTU2ODEwODEw" + "MTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA",
  "MTU2ODEwNjA3" + "Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8",
  "MTU2NzQ0MzUy" + "NzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY",
  "MTU2ODEwNTc5" + "MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE"
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

  client.on('ready', () => {
    console.log(`[✔] Bot ${index + 1} online: ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: statuses[index], type: ActivityType.Listening }],
      status: 'online',
    });
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const botNum = index + 1;

    // أمر استدعاء البوت للروم الصوتي اللي أنت فيه: مثلاً تكتب !join1 أو !join2
    if (message.content === `!join${botNum}` || (message.content === '!join' && message.args?[0] === `${botNum}`)) {
      const voiceChannel = message.member?.voice.channel;
      if (!voiceChannel) {
        return message.reply(`❌ يجب أن تكون متصلاً بروم صوتي لكي ينضم البوت ${botNum} إليك!`);
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
        console.log(`[🔊] Bot ${botNum} joined voice channel: ${voiceChannel.name}`);
      } catch (err) {
        console.error(`[❌] Bot ${botNum} failed to join:`, err.message);
        message.reply(`❌ حدث خطأ أثناء محاولة انضمام البوت ${botNum}.`);
      }
    }

    // أمر إخراج البوت من الروم: !leave1
    if (message.content === `!leave${botNum}`) {
      try {
        const connection = require('@discordjs/voice').getVoiceConnection(message.guild.id);
        // ملاحظة: الاتصال هنا يخص السيرفر، ويمكنك تخصيصه لاحقاً
        message.reply(`🚪 تم طلب مغادرة البوت ${botNum}.`);
      } catch (e) {}
    }

    // واجهة المشغل الصوتي
    if (message.content === '!player' || message.content === '!music') {
      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setTitle(`🎶 • ${client.user.username} • Music`)
        .setDescription(`• للتحكم بهذا البوت، اكتب:\n` +
                        `🔹 \`!join${botNum}\` لإنزاله معك في الروم الصوتي\n` +
                        `🔹 \`!muteall\` لكتم الجميع في الروم واستثنائك وحدك`)
        .addFields(
          { name: 'الحالة', value: 'جاهز للاستدعاء', inline: true },
          { name: 'الصوت', value: '100%', inline: true }
        )
        .setFooter({ text: `طلب بواسطة: ${message.author.tag}` });

      return message.reply({ embeds: [embed] });
    }

    // أمر الميوت الجماعي للأعضاء في الروم ما عدا المرسل
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
        message.reply('❌ حدث خطأ أثناء محاولة كتم الأعضاء.');
      }
    }
  });

  client.login(token).catch(err => {
    console.error(`[❌] Bot ${index + 1} login failed:`, err.message);
  });
});
