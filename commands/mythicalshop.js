module.exports = (bot) => {
  bot.onText(/^\/mythicalshop$/, (msg) => {
    bot.sendMessage(msg.chat.id, "Mythical shop is alive ✅");
  });
};
