const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendVideo(
    chatId,
    "https://files.catbox.moe/4kr4d6.mp4",
    {
      caption: `
⚔️ *WELCOME TO DEMON SLAYER BOT* ⚔️

🔥 Collect legendary Demon Slayers  
👹 Fight powerful demons  
🎒 Build your inventory  
🏆 Climb the leaderboard  

Use /help to begin your journey.

*Are you ready to become the strongest?*
      `,
      parse_mode: "Markdown"
    }
  );
});

console.log("Bot running...");
