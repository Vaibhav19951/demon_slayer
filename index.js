const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "⚔️ Welcome to Demon Slayer Bot");
});

require("./commands/start")(bot);
require("./commands/battle")(bot);
require("./commands/help")(bot);
require("./commands/inventory")(bot);
require("./commands/profile")(bot);
require("./commands/summon")(bot);

console.log("Bot running...");
