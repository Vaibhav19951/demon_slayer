const weapons = require("../asset/weapons.js");
const players = require("../data/players.js");

module.exports = (bot) => {
  bot.onText(/\/buy (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const weaponId = parseInt(match[1]);

    if (!players[chatId]) {
      players[chatId] = {
        gold: 1000,
        inventory: [],
        equippedWeapon: null,
      };
    }

    const player = players[chatId];
    const weapon = weapons.find((w) => w.id === weaponId);

    if (!weapon) return bot.sendMessage(chatId, "❌ Weapon not found");

    if (player.gold < weapon.price) {
      return bot.sendMessage(chatId, "❌ Not enough gold");
    }

    player.gold -= weapon.price;
    player.inventory.push(weapon);

    bot.sendMessage(
      chatId,
      `✅ Purchased ${weapon.name}

Use /equip ${weapon.id} to equip it`
    );
  });
};
