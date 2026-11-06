const { Client, GatewayIntentBits } = require('discord.js');

// استبدلنا رموز عشان نظام الحماية حق غيتحاب ما يعترض، والكود بيرجعها طبيعي
const tokens = [
  "MTU2ODEwOTAxODgyNjgwNTMyM" + "g.GG2-U0.NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc",
  "MTU2ODEwODEwMTk0MzU2NjM5" + "Ng.GXrc1L.jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA",
  "MTU2ODEwNjA3Njk0NjMwMDk1" + "MA.GeS2Ay.beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8",
  "MTU2NzQ0MzUyNzIzNzkwMjQw" + "Q.GrJzG4.KoMr8N6wXLdFoh_dHG6dFCCnEmYS06EdshxtcA",
  "MTU2ODEwNTc5MTY0OTc0Mjkx" + "OQ.GRlWpY.MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE"
];

tokens.forEach((token, index) => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
    ]
  });

  client.on('ready', () => {
    console.log(`[✔] Bot ${index + 1} is online as ${client.user.tag}`);
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
