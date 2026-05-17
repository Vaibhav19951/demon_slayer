const characters = require("../asset/assets");

module.exports = (bot) => {
  bot.onText(/\/summon/, async (msg) => {
    const chatId = msg.chat.id;

    const randomCharacter =
      characters[Math.floor(Math.random() * characters.length)];

    try {
      await bot.sendPhoto(chatId, randomCharacter.image, {
        caption: `🎴 SUMMON SUCCESSFUL!

👤 Character: ${randomCharacter.name}
✨ Rarity: ${randomCharacter.rarity}`,
      });
    } catch (error) {
      console.log(error.message);
      bot.sendMessage(chatId, "❌ Summon failed");
    }
  });
};
