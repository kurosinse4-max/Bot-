const { Client, GatewayIntentBits } = require('discord.js');

// قراءة التوكنات بشكل آمن ومشفر من متغيرات البيئة
const tokens = [
  process.env.TOKEN_1, // شرق النيل
  process.env.TOKEN_2, // أركويت
  process.env.TOKEN_3, // الكلاكلة
  process.env.TOKEN_4, // بحري
  process.env.TOKEN_5  // أمدرمان
];

tokens.forEach((token, index) => {
  if (!token) {
    console.log(`[!] Token ${index + 1} is missing!`);
    return;
  }

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
