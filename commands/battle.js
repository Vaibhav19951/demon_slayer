module.exports = (bot) => {
  bot.onText(/\/battle/, async (msg) => {
    const win = Math.random() > 0.5;

    if (win) {
      await bot.sendMessage(msg.chat.id, "⚔️ You defeated the demon!");
    } else {
      await bot.sendMessage(msg.chat.id, "💀 You lost the battle...");
    }
  });
};