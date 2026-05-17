module.exports = (bot) => {
  bot.onText(/\/inventory/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      await bot.sendMessage(chatId, "🎒 Your inventory is empty (for now).");
    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "Error loading inventory 😓");
    }
  });
};
