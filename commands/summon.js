const path = require("path");

module.exports = (bot) => {
  const characters = [
    {
      name: "🔥 Tanjiro Kamado",
      rarity: "Rare",
      image: path.join(__dirname, "../assets/tanjiro.jpeg"),
    },
    {
      name: "⚡ Zenitsu Agatsuma",
      rarity: "Epic",
      image: path.join(__dirname, "../assets/zenitsu.jpeg"),
    },
    {
      name: "🐗 Inosuke Hashibira",
      rarity: "Common",
      image: path.join(__dirname, "../assets/inosuke.jpeg"),
    },
    {
      name: "🌊 Giyu Tomioka",
      rarity: "Legendary",
      image: path.join(__dirname, "../assets/giyu.jpeg"),
    },
  ];

  bot.onText(/\/summon/, async (msg) => {
    const chatId = msg.chat.id;

    const randomCharacter =
      characters[Math.floor(Math.random() * characters.length)];

    try {
      await bot.sendPhoto(chatId, randomCharacter.image, {
        caption: `🎴 SUMMON SUCCESSFUL!

👤 Character: ${randomCharacter.name}
✨ Rarity: ${randomCharacter.rarity}

⚔️ Train your fighter and become stronger!`,
      });
    } catch (error) {
      console.log("Summon error:", error.message);
      bot.sendMessage(chatId, "❌ Summon failed. Check assets folder.");
    }
  });
};