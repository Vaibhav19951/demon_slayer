const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendVideo(
      chatId,
      "https://youtu.be/k_CxMefC7mA", // Your Demon Slayer 4K Edit Link
      {
        caption: `⚔️ *WELCOME TO DEMON SLAYER BOT* ⚔️

🔥 Collect legendary Demon Slayers  
👹 Fight powerful demons  
🎒 Build your inventory  
🏆 Climb the leaderboard  

Use /help to begin your journey.

*Are you ready to become the strongest?*`,
        parse_mode: "Markdown"
      }
    );
  } catch (error) {
    console.error("Error sending video:", error);
  }
});

console.log("Bot running...");
