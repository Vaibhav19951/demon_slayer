/**
 * VELIX OS V2.5 | CENTRALized WARRIOR SUMMONING GATEWAY
 * Fully Linked with Centralized Ledger & Inventory Engine
 * Concurrency Safe & Cost Validated (2000+ Active Users)
 */

const characters = require("../asset/assets");

console.log("🦅 [LOADED SUCCESS] Summoning Matrix Linked: summon.js");

module.exports = (bot) => {
  
  // Command: /summon - PULL RARE WARRIORS FROM THE GACHA VEIL
  bot.onText(/\/summon/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // 1. Fetch user profile from Core Centralized Engine
    const player = bot.getPlayerData(userId);
    if (!player) return;

    // Safety fallback for crystal field validation
    if (player.crystals === undefined) player.crystals = 0;

    // 2. Cost Verification Guard Clause (1 Crystal per summon)
    const summonCost = 1;
    if (player.crystals < summonCost) {
      const lowFundsLayout = 
        `❌ **SUMMONING GATEWAY REJECTED**\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🚨 **Reason:** Insufficient Spiritual Crystals.\n` +
        `💎 **Required:** \`${summonCost}\` Crystal\n` +
        `💰 **Your Vault:** \`${player.crystals}\` Crystals\n\n` +
        `💡 *Run \`/task\` to earn precious crystals or exchange your Crow Coins via \`/convert c2cr <amount>\`!*`;
      
      return bot.sendMessage(chatId, lowFundsLayout, { parse_mode: "Markdown" });
    }

    // 3. Extract random character securely from assets ledger
    if (!Array.isArray(characters) || characters.length === 0) {
      return bot.sendMessage(chatId, "❌ **Core Error:** Summoning pool asset ledger is empty or corrupted.");
    }
    
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

    // 4. Update ledger balances and inventory structures safely
    player.crystals -= summonCost;

    // Check both standard naming conventions to avoid data loss overrides
    if (!player.inventory) player.inventory = [];
    
    // Create character instance object block
    const characterInstance = {
      name: randomCharacter.name,
      rarity: randomCharacter.rarity || "Common",
      level: 1,
      exp: 0
    };

    // Save to character pool registry arrays
    player.inventory.push(characterInstance);
    if (player.owned_characters) {
      player.owned_characters.push(characterInstance);
    }

    // 5. Commit state modifications updates back to global memory files
    bot.savePlayerData(userId, player);

    // 6. Deploy Premium Aesthetic Layout Render
    try {
      const summonSuccessLayout = 
        `🎴 **VELIX OS | SUMMONING GATEWAY OPENED**\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `✨ *The space-time veil tears apart as a spiritual entity responds to your summon call...*\n\n` +
        `👤 **CHARACTER:** *${randomCharacter.name}*\n` +
        `🔮 **RARITY:**  \`[ ${randomCharacter.rarity || "COMMON"} ]\`\n\n` +
        `📉 **Transaction:** \`-${summonCost}\` Precious Crystal Deducted.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ *Warrior data registered and synchronized with your /profile Card Roster!*`;

      await bot.sendPhoto(chatId, randomCharacter.image, {
        caption: summonSuccessLayout,
        parse_mode: "Markdown"
      });

    } catch (error) {
      console.error("❌ Summon layout rendering error:", error.message);
      
      // Secondary fallback text message in case image URL drops or fails
      bot.sendMessage(
        chatId, 
        `🎴 **SUMMON SUCCESSFUL (IMAGE DROP ERROR)**\n\n👤 **Slayer:** ${randomCharacter.name}\n✨ **Rarity:** ${randomCharacter.rarity || "Common"}\n\n*Character safely added to inventory despite layout error.*`
      );
    }
  });
};
