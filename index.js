const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const tokens = [
  "MTU2ODEwOTAxODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc",
  "MTU2ODEwODEwMTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA",
  "MTU2ODEwNjA3Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8",
  "MTU2NzQ0MzUyNzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY",
  "MTU2ODEwNTc5MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE"
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
    console.log(`[✔] Bot ${index + 1} is online as ${client.user.tag}`);
    
    client.user.setPresence({
      activities: [{ name: statuses[index], type: ActivityType.Listening }],
      status: 'online',
    });
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
