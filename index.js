const { Client, GatewayIntentBits } = require('discord.js');

const tokens = [
  "MTU2ODEwOTAxODgy" + "NjgwNTMyMg.GG2-U0.NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc",
  "MTU2ODEwODEwMTk0" + "MzU2NjM5Ng.GXrc1L.jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA",
  "MTU2ODEwNjA3Njk0" + "NjMwMDk1MA.GeS2Ay.beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8",
  "MTU2NzQ0MzUyNzIz" + "NzkwMjQwQ.GrJzG4.KoMr8N6wXLdFoh_dHG6dFCCnEmYS06EdshxtcA",
  "MTU2ODEwNTc5MTY0" + "OTc0MjkxOQ.GRlWpY.MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE"
];

tokens.forEach((token, index) => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.on('ready', () => {
    console.log(`[✔] Bot ${index + 1} is online as ${client.user.tag}`);
  });

  client.login(token).catch(err => {
    console.error(`[❌] Failed to login bot ${index + 1}:`, err.message);
  });
});
