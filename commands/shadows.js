const { getPlayer, savePlayer, getWorldData, setWorldData } = require("../data/players");

module.exports = (bot) => {

  // /shadows — view shadow army
  bot.onText(/\/shadows$/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const player = getPlayer(userId);

    if (player.anime !== "Solo Leveling") {
      return bot.sendMessage(chatId,
        `❌ Shadow army is only available in *Solo Leveling* world!\nUse /switch`,
        { parse_mode: "Markdown" }
      );
    }

    const worldData = getWorldData(player);
    const shadows = worldData.shadows || [];

    const maxSlots = {
      "E-Rank": 2, "D-Rank": 5, "C-Rank": 10, "B-Rank": 20,
      "A-Rank": 35, "S-Rank": 50, "National Level": 75, "Shadow Monarch": 999
    };
    const max = maxSlots[worldData.rank || "E-Rank"] || 2;

    if (shadows.length === 0) {
      return bot.sendMessage(chatId,
        `👥 *SHADOW ARMY*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `_No shadows yet!_\n\n` +
        `Defeat dungeon bosses or gate bosses to arise shadows.\n` +
        `Each boss has a chance to join your army on defeat.\n\n` +
        `📊 Slots: \`0/${max}\` (${worldData.rank || "E-Rank"})`,
        { parse_mode: "Markdown" }
      );
    }

    const totalAtk = shadows.reduce((sum, s) => sum + (s.atk || 0), 0);
    const totalHp = shadows.reduce((sum, s) => sum + (s.hp || 0), 0);

    const shadowList = shadows.map((s, i) =>
      `\`${i + 1}.\` ${s.emoji || "🌑"} *${s.name}* [Lv.${s.level || 1}]\n` +
      `     └ ⚔️ ATK: \`${s.atk}\` | ❤️ HP: \`${s.hp}\``
    ).join("\n\n");

    bot.sendMessage(chatId,
      `👥 *SHADOW ARMY*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📊 Slots: \`${shadows.length}/${max}\` (${worldData.rank || "E-Rank"})\n` +
      `⚔️ Total ATK: \`${totalAtk}\` | ❤️ Total HP: \`${totalHp}\`\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `${shadowList}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💡 Use \`/shadowlevel <name>\` to level up a shadow\n` +
      `💡 Shadows add bonus ATK in all battles`,
      { parse_mode: "Markdown" }
    );
  });

  // /shadowlevel <name> — level up a shadow using shadow cores
  bot.onText(/\/shadowlevel (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const shadowName = match[1].trim();
    const player = getPlayer(userId);

    if (player.anime !== "Solo Leveling") {
      return bot.sendMessage(chatId, `❌ Solo Leveling world only!`);
    }

    const worldData = getWorldData(player);
    const shadows = worldData.shadows || [];
    const shadow = shadows.find(s => s.name.toLowerCase() === shadowName.toLowerCase());

    if (!shadow) {
      return bot.sendMessage(chatId,
        `❌ Shadow *${shadowName}* not found in your army!\nUse /shadows to see your list.`,
        { parse_mode: "Markdown" }
      );
    }

    const coresNeeded = (shadow.level || 1) * 2;
    const ownedCores = (player.materials || {}).shadow_core || 0;

    if (ownedCores < coresNeeded) {
      return bot.sendMessage(chatId,
        `❌ Not enough Shadow Cores!\n` +
        `Need: \`${coresNeeded}\` | Have: \`${ownedCores}\`\n\n` +
        `Get Shadow Cores from dungeon drops and gate rewards.`,
        { parse_mode: "Markdown" }
      );
    }

    // Level up
    player.materials.shadow_core -= coresNeeded;
    shadow.level = (shadow.level || 1) + 1;
    shadow.atk = Math.floor(shadow.atk * 1.2);
    shadow.hp = Math.floor(shadow.hp * 1.15);

    setWorldData(player, worldData);
    savePlayer(userId, player);

    bot.sendMessage(chatId,
      `🌑 *SHADOW LEVELED UP!*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `${shadow.emoji || "🌑"} *${shadow.name}* → Level ${shadow.level}\n\n` +
      `⚔️ ATK: \`${Math.floor(shadow.atk / 1.2)}\` → \`${shadow.atk}\` *(+20%)*\n` +
      `❤️ HP: \`${Math.floor(shadow.hp / 1.15)}\` → \`${shadow.hp}\` *(+15%)*\n\n` +
      `🔮 Shadow Cores used: \`${coresNeeded}\`\n` +
      `🔮 Remaining: \`${player.materials.shadow_core}\``,
      { parse_mode: "Markdown" }
    );
  });

  // /arise — manual arise attempt after winning a hunt (costs arise token)
  bot.onText(/\/arise/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
      `🌑 *ARISE SYSTEM*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Shadows are arisen automatically when you:\n\n` +
      `🏰 Defeat dungeon bosses (Floors 10, 25, 50, 75, 100)\n` +
      `🚪 Defeat S-Rank gate bosses\n\n` +
      `Each boss has a hidden arise chance.\n` +
      `Rarer bosses = higher chance!\n\n` +
      `💡 *Tip:* Use /shadows to view your army.`,
      { parse_mode: "Markdown" }
    );
  });
};
