const { Client, GatewayIntentBits } = require('discord.js');

const tokens = [
  "MTU2ODEwOTAxOdgynJgwNTMyMg.GJPEsp.oC4suJh63k0XPXI__9SoArq046yFGFx7seeH7c", // أركويت
  "MTU2ODewODVMTk0MzU2NzkmM5Ng.Gin9g_.zmHEceG7CbPg1j0mwfXluafoOuu5-jrCBGKE", // شرق النيل
  "MTU2ODEwNnA3NjK0NjMwMk1mA.GaUbAi.ECOvDzomnq1Qx90BUHwZtESbzgwaAgRsLnefe0", // الكلاكلة
  "MTU2NzQ0MzUyNzIzNzkwMjQwQ.GH76R0.-_DQz1ph4FDBeAmPzir7knc6Ccmj8PF7-FYc78", // بحري
  "MTU2ODEwNTMTY0OTcC0MjkxOQ.Gm-3I2.hLRtb8rzBHe6KbcbqUhc2mXPUDIYY-Z-6NHbzc"  // أمدرمان
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
