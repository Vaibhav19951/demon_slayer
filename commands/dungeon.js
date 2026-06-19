const { getPlayer, savePlayer, getWorldData, setWorldData } = require("../data/players");
const { processXP, applyDeathPenalty, isInjured, getRankByLevel } = require("../asset/solo_leveling/ranks");
const { getFloorConfig, isBossFloor, getLastCheckpoint, isCheckpoint, scaleMonster } = require("../asset/solo_leveling/dungeon/floors");
const { bosses } = require("../asset/solo_leveling/dungeon/bosses");
const { FLOOR_REWARDS, getFloorBaseReward } = require("../asset/solo_leveling/dungeon/rewards");

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// =========================================
// LOAD MONSTER POOL FOR A FLOOR
// =========================================
const getMonsterPool = (floorConfig) => {
  try {
    return require(`../asset/solo_leveling/dungeon/monsters/${floorConfig.file}`).monsters;
  } catch (e) {
    return [{ id: "dungeon_mob", name: "Dungeon Monster", emoji: "👹", hp: 200, atk: 40, def: 20, spd: 30, xpReward: [20, 40], goldReward: [40, 80] }];
  }
};

// =========================================
// BATTLE SIMULATION
// =========================================
const simulateBattle = (playerStats, monster, injured = false) => {
  const mult = injured ? 0.5 : 1;
  let playerHp = playerStats.hp;
  let monsterHp = monster.hp;
  const log = [];
  let round = 0;

  while (playerHp > 0 && monsterHp > 0 && round < 25) {
    round++;
    const playerFirst = (playerStats.spd * mult) >= monster.spd;

    const attack = (atkStat, defStat) => Math.max(1, Math.floor(atkStat - defStat * 0.4) + rand(-3, 5));

    if (playerFirst) {
      const dmg = attack(playerStats.atk * mult, monster.def);
      monsterHp -= dmg;
      log.push(`⚔️ You deal \`${dmg}\` dmg → Monster HP: \`${Math.max(0, monsterHp)}\``);
      if (monsterHp <= 0) break;
      const mDmg = attack(monster.atk, playerStats.def * mult);
      playerHp -= mDmg;
      log.push(`💥 Monster deals \`${mDmg}\` dmg → Your HP: \`${Math.max(0, playerHp)}\``);
    } else {
      const mDmg = attack(monster.atk, playerStats.def * mult);
      playerHp -= mDmg;
      log.push(`💥 Monster deals \`${mDmg}\` dmg → Your HP: \`${Math.max(0, playerHp)}\``);
      if (playerHp <= 0) break;
      const dmg = attack(playerStats.atk * mult, monster.def);
      monsterHp -= dmg;
      log.push(`⚔️ You deal \`${dmg}\` dmg → Monster HP: \`${Math.max(0, monsterHp)}\``);
    }
  }

  return { won: monsterHp <= 0, log: log.slice(-6) };
};

// =========================================
// PLAYER STATS
// =========================================
const getPlayerStats = (worldData) => {
  const lvl = worldData.level || 1;
  return {
    hp:  100 + lvl * 10,
    atk: 20  + lvl * 5,
    def: 10  + lvl * 3,
    spd: 15  + lvl * 2
  };
};

// =========================================
// LOOT ROLLER
// =========================================
const rollLoot = (dropTable = []) => dropTable.filter(d => Math.random() < d.chance).map(d => d.item);

// =========================================
// ADD SHADOW AFTER ARISE
// =========================================
const tryArise = (player, boss, worldData) => {
  if (!boss.ariseChance || Math.random() > boss.ariseChance) return null;
  const shadow = {
    id: `${boss.shadow_name || boss.name}_${Date.now()}`,
    name: boss.shadow_name || boss.name,
    emoji: boss.shadow_emoji || boss.emoji,
    level: 1,
    atk: Math.floor(boss.atk * 0.3),
    hp: Math.floor(boss.hp * 0.2),
    obtained_at: new Date().toISOString()
  };
  worldData.shadows = worldData.shadows || [];

  const maxSlots = { "E-Rank": 2, "D-Rank": 5, "C-Rank": 10, "B-Rank": 20, "A-Rank": 35, "S-Rank": 50, "National Level": 75, "Shadow Monarch": 999 };
  const max = maxSlots[worldData.rank] || 2;
  if (worldData.shadows.length >= max) return null;

  worldData.shadows.push(shadow);
  return shadow;
};

// =========================================
// MODULE
// =========================================
module.exports = (bot) => {

  // /dungeon — enter or view status
  bot.onText(/\/dungeon$/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const player = getPlayer(userId);
    const world = player.anime || "Demon Slayer";

    if (world !== "Solo Leveling") {
      return bot.sendMessage(chatId,
        `❌ The dungeon system is only available in *Solo Leveling* world!\nUse /switch to enter Solo Leveling.`,
        { parse_mode: "Markdown" }
      );
    }

    const worldData = getWorldData(player);
    const floor = worldData.dungeon_floor || 1;
    const checkpoint = worldData.last_checkpoint || 1;
    const config = getFloorConfig(floor);
    const injured = isInjured(worldData);

    bot.sendMessage(chatId,
      `🏰 *INFINITE CASTLE DUNGEON*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 *Current Floor:* \`${floor}/100\`\n` +
      `🔖 *Last Checkpoint:* \`Floor ${checkpoint}\`\n` +
      `⚔️ *Floor Tier:* \`${config.rank}\`\n` +
      `${isBossFloor(floor) ? "👹 *BOSS FLOOR!*\n" : ""}` +
      `${injured ? "⛔ *INJURED* — Stats at 50%!\n" : ""}` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏆 *Highest Floor:* \`${player.highest_dungeon_floor || 0}\`\n\n` +
      `*Checkpoints:* Floor 10 ✦ 25 ✦ 50 ✦ 75 ✦ 100\n\n` +
      `Ready to fight?`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: `⚔️ Enter Floor ${floor}`, callback_data: `dng_enter:${userId}` }],
            [{ text: "📊 My Stats", callback_data: `dng_stats:${userId}` }]
          ]
        }
      }
    );
  });

  // /dungeon <floor> — jump to specific floor (only if already cleared)
  bot.onText(/\/dungeon (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const targetFloor = parseInt(match[1]);
    const player = getPlayer(userId);
    const world = player.anime || "Demon Slayer";

    if (world !== "Solo Leveling") {
      return bot.sendMessage(chatId, `❌ Solo Leveling world only! Use /switch`, { parse_mode: "Markdown" });
    }

    const worldData = getWorldData(player);
    const maxReached = player.highest_dungeon_floor || 0;

    if (targetFloor > maxReached + 1 || targetFloor < 1 || targetFloor > 100) {
      return bot.sendMessage(chatId,
        `❌ You can only go to floors you've already reached!\n📍 Your max: \`Floor ${maxReached}\``,
        { parse_mode: "Markdown" }
      );
    }

    worldData.dungeon_floor = targetFloor;
    worldData.last_checkpoint = getLastCheckpoint(targetFloor);
    setWorldData(player, worldData);
    savePlayer(userId, player);

    bot.sendMessage(chatId, `✅ Jumped to *Floor ${targetFloor}*! Use /dungeon to enter.`, { parse_mode: "Markdown" });
  });

  // =========================================
  // CALLBACK HANDLER
  // =========================================
  bot.on("callback_query", async (query) => {
    if (!query.data.startsWith("dng_")) return;

    const [action, userId] = query.data.split(":");
    const clickerId = query.from.id.toString();

    if (clickerId !== userId) {
      return bot.answerCallbackQuery(query.id, { text: "❌ Not your dungeon!", show_alert: true });
    }

    await bot.answerCallbackQuery(query.id);

    const player = getPlayer(userId);
    let worldData = getWorldData(player);
    const chatId = query.message.chat.id;

    // ── STATS ──
    if (action === "dng_stats") {
      const floor = worldData.dungeon_floor || 1;
      const stats = getPlayerStats(worldData);
      const injured = isInjured(worldData);
      return bot.sendMessage(chatId,
        `📊 *YOUR DUNGEON STATS*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `❤️ HP: \`${stats.hp}\`\n` +
        `⚔️ ATK: \`${stats.atk}\`\n` +
        `🛡️ DEF: \`${stats.def}\`\n` +
        `💨 SPD: \`${stats.spd}\`\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📍 Floor: \`${floor}\`\n` +
        `🏅 Rank: \`${worldData.rank}\`\n` +
        `${injured ? "⛔ *INJURED* — all stats ×0.5" : "✅ Status: Normal"}`,
        { parse_mode: "Markdown" }
      );
    }

    // ── ENTER FLOOR ──
    if (action === "dng_enter") {
      const floor = worldData.dungeon_floor || 1;
      const floorConfig = getFloorConfig(floor);
      const injured = isInjured(worldData);
      const playerStats = getPlayerStats(worldData);
      const isBoss = isBossFloor(floor);

      let monster;

      if (isBoss) {
        const bossData = bosses[floor];
        if (!bossData) return bot.sendMessage(chatId, "❌ Boss data not found!");
        monster = {
          ...bossData,
          xpReward: [bossData.xpReward, bossData.xpReward],
          goldReward: [bossData.goldReward, bossData.goldReward]
        };
      } else {
        const pool = getMonsterPool(floorConfig);
        const raw = pick(pool);
        monster = scaleMonster(raw, floorConfig.diffMult, floor);
        monster.xpReward = monster.xpReward || [10, 30];
        monster.goldReward = monster.goldReward || [20, 60];
        monster.dropTable = raw.dropTable || [];
      }

      // Run battle
      const result = simulateBattle(playerStats, monster, injured);
      const baseReward = getFloorBaseReward(floor);

      if (result.won) {
        // XP & Gold
        const xpGain = isBoss
          ? monster.xpReward[0]
          : rand(monster.xpReward[0] || baseReward.xp, monster.xpReward[1] || baseReward.xp * 2);
        const goldGain = isBoss
          ? monster.goldReward[0]
          : rand(monster.goldReward[0] || baseReward.gold, monster.goldReward[1] || baseReward.gold * 2);

        // Loot
        const loot = rollLoot(monster.dropTable || []);

        // Process XP
        const xpResult = processXP(worldData, xpGain, "Solo Leveling");
        worldData.level = xpResult.new_level;
        worldData.xp = xpResult.new_xp;
        worldData.xp_needed = require("../asset/solo_leveling/ranks").getXpNeeded(xpResult.new_level, "Solo Leveling");
        if (xpResult.rank_changed) worldData.rank = xpResult.new_rank;

        // Advance floor
        const oldFloor = floor;
        worldData.dungeon_floor = floor + 1;
        if (isCheckpoint(floor)) worldData.last_checkpoint = floor;
        if (floor > (player.highest_dungeon_floor || 0)) player.highest_dungeon_floor = floor;

        // Update global
        player.coins = (player.coins || 0) + goldGain;
        player.total_kills = (player.total_kills || 0) + 1;
        player.battles_won = (player.battles_won || 0) + 1;
        for (const item of loot) {
          player.materials = player.materials || {};
          player.materials[item] = (player.materials[item] || 0) + 1;
        }

        // Boss arise
        let aroseText = "";
        if (isBoss) {
          const arisen = tryArise(player, monster, worldData);
          if (arisen) aroseText = `\n🌑 *ARISE!* ${arisen.emoji} *${arisen.name}* joined your shadow army!`;
        }

        // Checkpoint reward
        let checkpointText = "";
        if (FLOOR_REWARDS[oldFloor]) {
          const cr = FLOOR_REWARDS[oldFloor];
          player.coins += cr.gold;
          for (const item of cr.items) {
            player.materials[item] = (player.materials[item] || 0) + 1;
          }
          if (cr.title && !player.titles?.includes(cr.title)) {
            player.titles = player.titles || [];
            player.titles.push(cr.title);
          }
          checkpointText =
            `\n🏆 *CHECKPOINT BONUS!*\n` +
            `🪙 +${cr.gold} gold | 📦 ${cr.items.join(", ")}` +
            (cr.title ? `\n🏅 Title unlocked: *${cr.title}*` : "");
        }

        setWorldData(player, worldData);
        savePlayer(userId, player);

        const nextFloor = worldData.dungeon_floor;
        const nextIsBoss = isBossFloor(nextFloor);

        await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id
        }).catch(() => {});

        return bot.sendMessage(chatId,
          `⚡ *FLOOR ${oldFloor} CLEARED!*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `${monster.emoji} *${monster.name}* defeated!\n\n` +
          `📊 *Battle Log:*\n${result.log.join("\n")}\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🏆 *REWARDS:*\n` +
          `🧪 XP: \`+${xpGain}\`\n` +
          `🪙 Gold: \`+${goldGain}\`\n` +
          (loot.length > 0 ? `📦 Drops: ${loot.map(l => `\`${l}\``).join(", ")}\n` : "") +
          (xpResult.leveled_up ? `\n🎉 *LEVEL UP → Lv.${xpResult.new_level}!*` : "") +
          (xpResult.rank_changed ? `\n👑 *RANK UP → ${xpResult.new_rank}!*` : "") +
          aroseText +
          checkpointText +
          `\n━━━━━━━━━━━━━━━━━━━━\n` +
          (isBoss && monster.defeatMessage ? `_${monster.defeatMessage}_\n\n` : "") +
          (nextFloor <= 100 ? `📍 *Next:* Floor ${nextFloor}${nextIsBoss ? " 👹 BOSS!" : ""}` : `👑 *You have conquered the dungeon!*`),
          {
            parse_mode: "Markdown",
            reply_markup: nextFloor <= 100 ? {
              inline_keyboard: [[
                { text: `➡️ Enter Floor ${nextFloor}${nextIsBoss ? " 👹" : ""}`, callback_data: `dng_enter:${userId}` },
                { text: "🚪 Exit", callback_data: `dng_exit:${userId}` }
              ]]
            } : undefined
          }
        );

      } else {
        // LOST
        worldData = applyDeathPenalty(worldData, "dungeon");
        const goldLoss = Math.floor((player.coins || 0) * 0.10);
        const xpLoss = Math.floor((worldData.xp || 0) * 0.05);
        worldData.xp = Math.max(0, worldData.xp - xpLoss);
        player.coins = Math.max(0, (player.coins || 0) - goldLoss);

        const sentBack = worldData.dungeon_floor;
        const injuredNow = isInjured(worldData);

        setWorldData(player, worldData);
        savePlayer(userId, player);

        await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id
        }).catch(() => {});

        return bot.sendMessage(chatId,
          `💀 *DEFEATED ON FLOOR ${floor}!*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `${monster.emoji} *${monster.name}* was too powerful!\n\n` +
          `📊 *Battle Log:*\n${result.log.join("\n")}\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💸 *Penalties:*\n` +
          `🪙 Gold Lost: \`-${goldLoss}\`\n` +
          `🧪 XP Lost: \`-${xpLoss}\`\n` +
          `🔖 Sent back to: \`Floor ${sentBack}\`\n` +
          (injuredNow ? `\n⛔ *INJURED!* Stats at 50% for 30 min.\nUse /potion antidote to recover.` : "") +
          `\n\nUse /dungeon to try again!`,
          { parse_mode: "Markdown" }
        );
      }
    }

    // ── EXIT ──
    if (action === "dng_exit") {
      await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      }).catch(() => {});
      return bot.sendMessage(chatId,
        `🚪 *You exited the dungeon.*\nProgress saved! Use /dungeon to continue.`,
        { parse_mode: "Markdown" }
      );
    }
  });
};
