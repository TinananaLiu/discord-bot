const { Client, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

// 創建一個新的 Discord 客戶端
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 當 Bot 準備好時觸發
client.once("ready", () => {
  console.log("Bot is online!");
});

// 監聽消息事件
client.on("messageCreate", (message) => {
  console.log(message);
  if (message.content === "!ping") {
    message.channel.send("Pong!");
  }
});

// 登入 Discord
client.login(token);
// console.log("Bot token: ", token);
