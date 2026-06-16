const { getPlayer, savePlayer, getWorldData, setWorldData } = require("../data/players");
const { POTIONS } = require("../asset/global/potions");

module.exports = (bot) => {

  // /potion — show owned potions
  bot.onText(/\/potion$/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const player = getPlayer(userId);
    const potions = player.potions || {};
    const world = player.anime || "Demon Slayer";

    const owned = Object.entries(potions).filter(([, count]) => count > 0);

    if (owned.length === 0) {
      return bot.sendMessage(chatId,
        `🧪 *POTION BAG*\n━━━━━━━━━━━━━━━━\n_You have no potions!_\n\nBuy from /itemshop`,
        { parse_mode: "Markdown" }
      );
    }

    const list = owned.map(([id, count]) => {
      const p = POTIONS[id];
      if (!p) return null;
      const worldNote = p.world_only && p.world_only !== world ? ` _(${p.world_only} only)_` : "";
      return `${p.emoji} *${p.name}* ×${count}${worldNote}\n   └ ${p.description}\n   └ Use: \`/potion ${id}\``;
    }).filter(Boolean).join("\n\n");

    bot.sendMessage(chatId,
      `🧪 *POTION BAG*\n━━━━━━━━━━━━━━━━\n${list}`,
      { parse_mode: "Markdown" }
    );
  });

  // /potion <id> — use a potion
  bot.onText(/\/potion (\w+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const potionId = match[1].toLowerCase();

    const player = getPlayer(userId);
    const world = player.anime || "Demon Slayer";
    let worldData = getWorldData(player);

    const potion = POTIONS[potionId];
    if (!potion) {
      return bot.sendMessage(chatId, `❌ Unknown potion: \`${potionId}\`\nUse /potion to see your bag.`, { parse_mode: "Markdown" });
    }

    // World restriction
    if (potion.world_only && potion.world_only !== world) {
      return bot.sendMessage(chatId, `❌ *${potion.name}* can only be used in *${potion.world_only}* world!`, { parse_mode: "Markdown" });
    }

    const owned = (player.potions || {})[potionId] || 0;
    if (owned <= 0) {
      return bot.sendMessage(chatId, `❌ You don't have any *${potion.name}*!\nBuy from /itemshop`, { parse_mode: "Markdown" });
    }

    // Use the potion
    player.potions[potionId] -= 1;
    let resultMsg = "";

    if (potion.type === "heal") {
      const maxHp = 100 + ((worldData.level || 1) * 10);
      const heal = Math.floor(maxHp * potion.heal_percent);
      resultMsg = `❤️ Restored *${heal} HP*!`;
    }

    else if (potion.type === "elixir") {
      const maxHp = 100 + ((worldData.level || 1) * 10);
      const heal = maxHp;
      resultMsg = `✨ Full HP restored + ATK boosted 20% for next battle!`;
      // Store temp buff
      player.temp_buff = { atk_boost: 0.20, expires: Date.now() + 300000 };
    }

    else if (potion.type === "status") {
      // Antidote — remove injured
      worldData.injured_until = 0;
      worldData.deaths_this_hour = 0;
      setWorldData(player, worldData);
      resultMsg = `💚 *Injured status removed!* You are fully recovered.`;
    }

    else if (potion.type === "incubator") {
      // Speed shard — handled in incubate.js
      // Just give a reminder
      resultMsg = `⚡ Speed Shard ready! Use /incubator to apply it to an egg.`;
    }

    else if (potion.type === "pet") {
      const activePet = player.pets?.find(p => p.id === player.active_pet);
      if (!activePet) {
        // Refund
        player.potions[potionId] += 1;
        return bot.sendMessage(chatId, `❌ You have no active pet! Use /petequip first.`, { parse_mode: "Markdown" });
      }
      activePet.hunger = Math.min(100, (activePet.hunger || 0) + (potion.hunger_restore || 50));
      resultMsg = `🍖 *${activePet.name}* fed! Hunger: \`${activePet.hunger}/100\``;
    }

    else if (potion.type === "shadow" && world === "Solo Leveling") {
      player.temp_buff = { shadow_boost: 0.50, expires: Date.now() + 300000 };
      resultMsg = `🌑 Shadow army ATK boosted 50% for next battle!`;
    }

    else {
      resultMsg = `✅ Used *${potion.name}*!`;
    }

    savePlayer(userId, player);

    bot.sendMessage(chatId,
      `${potion.emoji} *POTION USED*\n━━━━━━━━━━━━━━━━\n` +
      `*${potion.name}* consumed!\n\n${resultMsg}\n\n` +
      `🧪 Remaining: \`×${player.potions[potionId]}\``,
      { parse_mode: "Markdown" }
    );
  });

  // /itemshop — buy potions
  bot.onText(/\/itemshop/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const player = getPlayer(userId);
    const { SHOP_POTIONS } = require("../asset/global/potions");

    const list = SHOP_POTIONS.slice(0, 8).map(p =>
      `${p.emoji} *${p.name}* — 🪙 \`${p.shop_cost}\`\n   └ ${p.description}\n   └ Buy: \`/buy_potion ${p.id}\``
    ).join("\n\n");

    bot.sendMessage(chatId,
      `🏪 *ITEM SHOP*\n━━━━━━━━━━━━━━━━\n` +
      `💰 Your coins: \`${player.coins || 0}\`\n\n${list}`,
      { parse_mode: "Markdown" }
    );
  });

  // /buy_potion <id> — purchase a potion
  bot.onText(/\/buy_potion (\w+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const potionId = match[1].toLowerCase();

    const player = getPlayer(userId);
    const potion = POTIONS[potionId];

    if (!potion || !potion.shop_cost) {
      return bot.sendMessage(chatId, `❌ Potion \`${potionId}\` not found in shop.`, { parse_mode: "Markdown" });
    }

    if ((player.coins || 0) < potion.shop_cost) {
      return bot.sendMessage(chatId,
        `❌ Not enough coins!\n💰 Need: \`${potion.shop_cost}\` | Have: \`${player.coins || 0}\``,
        { parse_mode: "Markdown" }
      );
    }

    player.coins -= potion.shop_cost;
    player.potions = player.potions || {};
    player.potions[potionId] = (player.potions[potionId] || 0) + 1;
    savePlayer(userId, player);

    bot.sendMessage(chatId,
      `${potion.emoji} *PURCHASED!*\n━━━━━━━━━━━━━━━━\n` +
      `*${potion.name}* added to your bag!\n` +
      `🪙 Coins left: \`${player.coins}\`\n` +
      `🧪 Owned: \`×${player.potions[potionId]}\`\n\n` +
      `Use it with: \`/potion ${potionId}\``,
      { parse_mode: "Markdown" }
    );
  });
};
