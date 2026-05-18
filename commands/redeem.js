const players = require("../data/players");
const mythical = require("../asset/mythical");

module.exports = (bot) => {
  bot.onText(/^\/redeem (.+)$/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    if (!players[userId]) {
      return bot.sendMessage(chatId, "❌ Use /start first.");
    }

    const player = players[userId];
    const cardId = match[1].trim().toLowerCase();

    const card = mythical.find(
      (c) => c.id.toLowerCase() === cardId
    );

    if (!card) {
      return bot.sendMessage(
        chatId,
        "❌ Invalid Card ID.\nUse /mythicalshop to check IDs."
      );
    }

    if (!player.mythicalCrystals) player.mythicalCrystals = 0;
    if (!player.cards) player.cards = [];

    const alreadyOwned = player.cards.some(
      (c) => c.id === card.id
    );

    if (alreadyOwned) {
      return bot.sendMessage(
        chatId,
        `⚠️ You already own ${card.name}`
      );
    }

    if (player.mythicalCrystals < card.cost) {
      return bot.sendMessage(
        chatId,
        `❌ Not enough crystals!\n\nNeed: ${card.cost}\nYou Have: ${player.mythicalCrystals}`
      );
    }

    player.mythicalCrystals -= card.cost;
    player.cards.push(card);

    bot.sendPhoto(chatId, card.image, {
      caption:
        `🎉 MYTHICAL REDEEMED 🎉\n\n` +
        `🎴 ${card.name}\n` +
        `⚔️ Power: ${card.power}\n` +
        `💠 Remaining Crystals: ${player.mythicalCrystals}`
    });
  });
};
