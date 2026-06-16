const { getPlayer, savePlayer, getWorldData, setWorldData } = require("../data/players");
const { processXP, applyDeathPenalty, isInjured, getRankByLevel } = require("../asset/solo_leveling/ranks");

// =========================================
// MONSTER POOLS PER WORLD
// These use your existing monster files
// =========================================
const getMonsterPool = (world, rank) => {
  try {
    if (world === "Solo Leveling") {
      const rankMap = {
        "E-Rank": "../asset/solo_leveling/dungeon/monsters/e_rank",
        "D-Rank": "../asset/solo_leveling/dungeon/monsters/d_rank",
        "C-Rank": "../asset/solo_leveling/dungeon/monsters/c_rank",
        "B-Rank": "../asset/solo_leveling/dungeon/monsters/b_rank",
        "A-Rank": "../asset/solo_leveling/dungeon/monsters/a_rank",
        "S-Rank": "../asset/solo_leveling/dungeon/monsters/s_rank",
        "National Level": "../asset/solo_leveling/dungeon/monsters/s_rank",
        "Shadow Monarch": "../asset/solo_leveling/dungeon/monsters/monarchs"
      };
      const file = rankMap[rank] || rankMap["E-Rank"];
      return require(file).monsters;
    } else {
      // Demon Slayer uses existing demons.js
      const demons = require("../asset/demons");
      return demons.demonRawArray || demons.demons || [];
    }
  } catch (e) {
    // Fallback generic monsters
    return [
      { id: "weak_demon", name: "Weak Demon", emoji: "👹", hp: 80, atk: 15, def: 5, spd: 10, xpReward: [10, 20], goldReward: [20, 40] },
      { id: "forest_beast", name: "Forest Beast", emoji: "🐺", hp: 100, atk: 20, def: 8, spd: 15, xpReward: [15, 25], goldReward: [30, 50] },
      { id: "stone_golem", name: "Stone Golem", emoji: "🗿", hp: 150, atk: 12, def: 25, spd: 5, xpReward: [20, 35], goldReward: [40, 70] }
    ];
  }
};

// =========================================
// RANDOM HELPERS
// =========================================
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Loot roll based on drop table
const rollLoot = (dropTable = []) => {
  const drops = [];
  for (const drop of dropTable) {
    if (Math.random() < drop.chance) drops.push(drop.item);
  }
  return drops;
};

// =========================================
// COMBAT SIMULATION
// Returns { won, rounds, playerHpLeft, log }
// =========================================
const simulateBattle = (playerStats, monster, injured = false) => {
  const mult = injured ? 0.5 : 1;
  let playerHp = playerStats.hp;
  let monsterHp = monster.hp;
  const log = [];
  let round = 0;
  const maxRounds = 20;

  while (playerHp > 0 && monsterHp > 0 && round < maxRounds) {
    round++;

    // Player attacks first (speed advantage if higher)
    const playerFirst = (playerStats.spd * mult) >= monster.spd;

    if (playerFirst) {
      const playerDmg = Math.max(1, Math.floor((playerStats.atk * mult) - monster.def * 0.5) + rand(-3, 5));
      monsterHp -= playerDmg;
      log.push(`⚔️ You deal **${playerDmg}** dmg → Monster HP: ${Math.max(0, monsterHp)}`);
      if (monsterHp <= 0) break;

      const monsterDmg = Math.max(1, Math.floor(monster.atk - (playerStats.def * mult) * 0.5) + rand(-2, 4));
      playerHp -= monsterDmg;
      log.push(`💥 Monster deals **${monsterDmg}** dmg → Your HP: ${Math.max(0, playerHp)}`);
    } else {
      const monsterDmg = Math.max(1, Math.floor(monster.atk - (playerStats.def * mult) * 0.5) + rand(-2, 4));
      playerHp -= monsterDmg;
      log.push(`💥 Monster deals **${monsterDmg}** dmg → Your HP: ${Math.max(0, playerHp)}`);
      if (playerHp <= 0) break;

      const playerDmg = Math.max(1, Math.floor((playerStats.atk * mult) - monster.def * 0.5) + rand(-3, 5));
      monsterHp -= playerDmg;
      log.push(`⚔️ You deal **${playerDmg}** dmg → Monster HP: ${Math.max(0, monsterHp)}`);
    }
  }

  return {
    won: monsterHp <= 0,
    rounds: round,
    playerHpLeft: Math.max(0, playerHp),
    log: log.slice(-6) // show last 6 rounds only
  };
};

// =========================================
// PLAYER BASE STATS
// =========================================
const getPlayerStats = (worldData) => {
  const level = worldData.level || 1;
  return {
    hp: 100 + (level * 10),
    atk: 20 + (level * 5),
    def: 10 + (level * 3),
    spd: 15 + (level * 2)
  };
};

// =========================================
// HUNT COOLDOWN (60 seconds)
// =========================================
const HUNT_COOLDOWN = 60 * 1000;

// =========================================
// MODULE EXPORT
// =========================================
module.exports = (bot) => {

  bot.onText(/\/hunt/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const player = getPlayer(userId);
    const world = player.anime || "Demon Slayer";
    let worldData = getWorldData(player);

    // ── Cooldown check ──
    const now = Date.now();
    const lastHunt = player.last_hunt || 0;
    const timeSince = now - lastHunt;

    if (timeSince < HUNT_COOLDOWN) {
      const secsLeft = Math.ceil((HUNT_COOLDOWN - timeSince) / 1000);
      return bot.sendMessage(chatId,
        `⏳ *Hunt Cooldown!*\nYou need to rest for **${secsLeft}s** before hunting again.`,
        { parse_mode: "Markdown" }
      );
    }

    // ── Injury check ──
    const injured = isInjured(worldData);
    const injuredNote = injured ? "\n⛔ *You are injured! Stats at 50%.*" : "";

    // ── Pick a random monster ──
    const rank = worldData.rank || "E-Rank";
    const monsters = getMonsterPool(world, rank);

    if (!monsters || monsters.length === 0) {
      return bot.sendMessage(chatId, "❌ No monsters found for your world. Check asset files.");
    }

    const monster = pick(Array.isArray(monsters) ? monsters : Object.values(monsters));
    const playerStats = getPlayerStats(worldData);

    // ── Simulate battle ──
    const result = simulateBattle(playerStats, monster, injured);

    // ── Build result message ──
    const emoji = world === "Solo Leveling" ? "⚡" : "⚔️";
    const monsterEmoji = monster.emoji || "👹";

    if (result.won) {
      // Calculate rewards
      const xpGain = Array.isArray(monster.xpReward)
        ? rand(monster.xpReward[0], monster.xpReward[1])
        : (monster.xpReward || 20);
      const goldGain = Array.isArray(monster.goldReward)
        ? rand(monster.goldReward[0], monster.goldReward[1])
        : (monster.goldReward || 40);

      // Loot drops
      const loot = rollLoot(monster.dropTable || []);

      // Process XP
      const xpResult = processXP(worldData, xpGain, world);
      worldData.level = xpResult.new_level;
      worldData.xp = xpResult.new_xp;
      worldData.xp_needed = require("../asset/solo_leveling/ranks").getXpNeeded(xpResult.new_level, world);
      if (xpResult.rank_changed) worldData.rank = xpResult.new_rank;

      // Save
      player.coins = (player.coins || 0) + goldGain;
      player.last_hunt = now;
      player.total_kills = (player.total_kills || 0) + 1;
      player.total_battles = (player.total_battles || 0) + 1;
      player.battles_won = (player.battles_won || 0) + 1;

      // Add loot to materials
      for (const item of loot) {
        player.materials = player.materials || {};
        player.materials[item] = (player.materials[item] || 0) + 1;
      }

      setWorldData(player, worldData);
      savePlayer(userId, player);

      let msg_text =
        `${emoji} *HUNT SUCCESS!*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `${monsterEmoji} *Monster:* \`${monster.name}\`\n` +
        `⚔️ *Rounds:* \`${result.rounds}\`\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 *Battle Log:*\n${result.log.join("\n")}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🏆 *REWARDS:*\n` +
        `🧪 *XP:* \`+${xpGain}\`\n` +
        `🪙 *Gold:* \`+${goldGain}\`\n` +
        (loot.length > 0 ? `📦 *Drops:* ${loot.map(l => `\`${l}\``).join(", ")}\n` : "") +
        (xpResult.leveled_up ? `\n🎉 *LEVEL UP! → Lv.${xpResult.new_level}*` : "") +
        (xpResult.rank_changed ? `\n👑 *RANK UP! → ${xpResult.new_rank}*` : "") +
        `${injuredNote}`;

      return bot.sendMessage(chatId, msg_text, { parse_mode: "Markdown" });

    } else {
      // Lost
      worldData = applyDeathPenalty(worldData, "normal");
      const goldLoss = Math.floor((player.coins || 0) * 0.10);
      const xpLoss = Math.floor((worldData.xp || 0) * 0.05);
      worldData.xp = Math.max(0, worldData.xp - xpLoss);
      player.coins = Math.max(0, (player.coins || 0) - goldLoss);
      player.last_hunt = now;
      player.total_battles = (player.total_battles || 0) + 1;

      const injuredNow = isInjured(worldData);

      setWorldData(player, worldData);
      savePlayer(userId, player);

      return bot.sendMessage(chatId,
        `${emoji} *HUNT FAILED!*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `${monsterEmoji} *Monster:* \`${monster.name}\` was too strong!\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 *Battle Log:*\n${result.log.join("\n")}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💸 *Penalties:*\n` +
        `🪙 *Gold Lost:* \`-${goldLoss}\`\n` +
        `🧪 *XP Lost:* \`-${xpLoss}\`\n` +
        (injuredNow ? `\n⛔ *INJURED! 3 deaths — stats at 50% for 30 min.*\nUse /potion antidote to recover.` : "") +
        `\n\nTrain harder and try again! (/hunt)`,
        { parse_mode: "Markdown" }
      );
    }
  });
};
