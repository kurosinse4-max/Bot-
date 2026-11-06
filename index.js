const { Client, GatewayIntentBits } = require('discord.js');

// استدعاء التوكنات من متغيرات البيئة السرية بأمان
const tokens = [
  process.env.TOKEN_1,
  process.env.TOKEN_2,
  process.env.TOKEN_3,
  process.env.TOKEN_4,
  process.env.TOKEN_5
].filter(Boolean); // لتصفية أي توكن فارغ

if (tokens.length === 0) {
  console.error("[❌] No tokens found in environment variables!");
  process.exit(1);
}

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

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
      message.reply(`Pong from ${client.user.username}! 🏓`);
    }
  });

  client.login(token).catch(err => {
    console.error(`[❌] Failed to login bot ${index + 1}:`, err);
  });
});
