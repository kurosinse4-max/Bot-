const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, Events } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const botsData = [
  { token: "MTU2ODEwOTAx" + "ODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc", name: "اركويت", status: "alone with the music." },
  { token: "MTU2ODEwODEw" + "MTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA", name: "بحري", status: "Lofi & Chill Beats" },
  { token: "MTU2ODEwNjA3" + "Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8", name: "الكلاكلة", status: "Vibing in Elara" },
  { token: "MTU2NzQ0MzUy" + "NzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY", name: "امدرمان", status: "Gaming & Soundtracks" },
  { token: "MTU2ODEwNTc5" + "MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE", name: "شرق النيل", status: "24/7 Music Stream" }
];

// دالة لتشغيل كل بوت بإنعزال تام لمنع تداخل الذاكرة
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

    client.once(Events.ClientReady, (c) => {
      console.log(`[✔] Bot ${botNum} (${botInfo.name}) is online as ${c.user.tag}`);
      c.user.setPresence({
        activities: [{ name: botInfo.status, type: ActivityType.Listening }],
        status: 'online',
      });
    });

    client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;

      const content = message.content.trim().toLowerCase();

      // أوامر الانضمام: !join1, !join2, !join3, !join4, !join5
      if (content === `!join${botNum}`) {
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) {
          return message.reply(`❌ يجب أن تكون متصلاً بروم صوتي لكي ينضم بوت **${botInfo.name}** إليك!`);
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
          console.log(`[🔊] Bot ${botNum} (${botInfo.name}) joined voice: ${voiceChannel.name}`);
        } catch (err) {
          console.error(`[❌] Bot ${botNum} failed to join:`, err.message);
          message.reply(`❌ حدث خطأ أثناء محاولة انضمام بوت ${botInfo.name}.`);
        }
      }

      // أمر واجهة المشغل الصوتي
      if (content === `!player${botNum}` || content === '!player') {
        const embed = new EmbedBuilder()
          .setColor(0x2f3136)
          .setTitle(`🎶 • ${botInfo.name} • Music Player`)
          .setDescription(`• للتحكم بهذا البوت، اكتب:\n` +
                          `🔹 \`!join${botNum}\` لإنزال **${botInfo.name}** معك في الروم\n` +
                          `🔹 \`!muteall\` لكتم الجميع في الروم واستثنائك وحدك`)
          .addFields(
            { name: 'اسم البوت', value: botInfo.name, inline: true },
            { name: 'الحالة', value: 'متصل وجاهز للطلب', inline: true }
          )
          .setFooter({ text: `طلب بواسطة: ${message.author.tag}` });

        return message.reply({ embeds: [embed] });
      }

      // أمر الميوت الجماعي
      if (content === '!muteall') {
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

    client.login(botInfo.token).catch(err => {
      console.error(`[❌] Bot ${botNum} (${botInfo.name}) login failed:`, err.message);
    });
  }, index * 4000); // 4 ثوانٍ فاصل بين كل بوت والثاني لضمان استقرار السيرفر تماماً
};

// تشغيل مصفوفة البوتات
botsData.forEach((bot, idx) => startBot(bot, idx));
