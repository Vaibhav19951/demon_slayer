/**
 * VELIX OS V2.5 | CENTRAL SUPPORT & COMM LINK GATEWAY
 * Delivers GC Link and High-Quality Visual Asset on PM Trigger
 */

module.exports = (bot) => {
  // 🔗 Apne Telegram Group (GC) ka link yahan daalo
  const GC_LINK = "https://t.me/demon_slayer_bot_kun"; 

  // 🎬 Ek badhiya Demon Slayer ya Anime GIF ka direct URL (High Quality)
  const PREMIUM_GIF_URL = "https://i.pinimg.com/originals/30/34/4f/30344f1ae3359ca8a0ff473a1c6e7b0a.gif"; 

  bot.onText(/\/support/, async (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;

    // Check ki user PM (private) mein hai ya group mein
    if (chatType !== 'private') {
      return bot.sendMessage(chatId, "❌ **Access Denied:** Please use this command in my Private Message (PM) link.", { parse_mode: 'Markdown' });
    }

    try {
      // Send High-Quality Animation/GIF with beautiful caption and Inline Button
      await bot.sendAnimation(chatId, PREMIUM_GIF_URL, {
        caption: `🏮 **VELIX OS | SUPPORT CORE TERMINAL**\n` +
                 `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                 `Welcome Slayer to the central network link. If you are facing any glitches, synchronization dropouts, or database latency, connect directly with our active operational hub.\n\n` +
                 `💬 **Tap the button below to join the Official GC:**`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🌐 Join Official GC', url: GC_LINK }
            ]
          ]
        }
      });
    } catch (err) {
      console.error("❌ Support Core GIF streaming failed:", err.message);
      // Fallback message agar GIF link fail ho jaye toh safely plain text chala jaye
      bot.sendMessage(chatId, `🏮 **VELIX OS | SUPPORT TERMINAL**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nJoin our Official GC here:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: '🌐 Join Official GC', url: GC_LINK }]]
        }
      });
    }
  });
};
