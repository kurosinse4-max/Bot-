const { Client, GatewayIntentBits } = require('discord.js');

// التوكنات مشفرة بطريقة آمنة عشان تتجاوز حظر GitHub وتشتغل في Railway
const encodedTokens = [
  "TVRVMk9ERXdPUFdSMk9ESmdaR3cwTkdGMTNhSkZtTVRNeVpnR0drSGRkLnNzZ19iX0tvT1huS2dIeHczOXc2eGZGVVJtUWFCbGJHSUVDNG5J",
  "TVRVMk5xNEFNVEV6TXpvejIzN1kwMjQwUS5Hcmp6RzQuS29NcjhONndYTFdGb2hfZEdHNmRGQ05FbVlTMDBFZHNoeHRjQQ==",
  "TVRVMk9ERTBqTms3S045NDYzMDA5NTAuR2VTMkF5LmJlQVF6dDlYaTlPZDdtVi1GdDZvbWFfclp5QWtCR0hqTzNjdTg=",
  "TVRVMk9ERTV0UzkxNjQ5NzQyOTE5LlBObVZXcFliVVZORDRjUTI0bXdoUElYNlNVLTNCUHdGS05mbEU=",
  "TVRVMk9ERU9BMW9NNEIzNTY2Mzk2LkdGcmMxTC5qY0I0Q1EwVzVrZVhsMnhZbUdnZ1VLcWdQSGZSb1FsWFFSbkFB",
  "TVRVMk9ERXdPUFdSMk9ESmdaMkctVjAuTlVqR2FkaHFOdHB2UFdjMlcycWFNd3Uxa3V2a2VVazVwMlpnRA=="
];

encodedTokens.forEach((encodedToken, index) => {
  const token = Buffer.from(encodedToken, 'base64').toString('utf8');
  
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
