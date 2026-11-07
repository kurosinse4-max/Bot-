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

    // فاصل زمني بسيط لكل بوت عشان يضمن الدخول بدون تعليق
    setTimeout(async () => {
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
    }, index * 2000); // فاصل ثانيتين بين كل بوت والثاني
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

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
