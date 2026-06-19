const { getPlayer, savePlayer, getWorldData, setWorldData } = require("../data/players");
const { canRankUp, getNextRank, RANKUP_BOSSES, processXP } = require("../asset/solo_leveling/ranks");

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getPlayerStats = (worldData) => {
  const lvl = worldData.level || 1;
  return { hp: 100 + lvl * 10, atk: 20 + lvl * 5, def: 10 + lvl * 3, spd: 15 + lvl * 2 };
};

const simulateBattle = (pStats, boss) => {
  let pHp = pStats.hp, bHp = boss.hp;
  const log = [];
  let round = 0;

  while (pHp > 0 && bHp > 0 && round < 30) {
    round++;
    const first = pStats.spd >= boss.spd;
    const atk = (a, d) => Math.max(1, Math.floor(a - d * 0.4) + rand(-5, 8));

    if (first) {
      const d = atk(pStats.atk, boss.def); bHp -= d;
      log.push(`⚔️ You deal \`${d}\` → Boss HP: \`${Math.max(0, bHp)}\``);
      if (bHp <= 0) break;
      const bd = atk(boss.atk, pStats.def); pHp -= bd;
      log.push(`💥 Boss deals \`${bd}\` → Your HP: \`${Math.max(0, pHp)}\``);
    } else {
      const bd = atk(boss.atk, pStats.def); pHp -= bd;
      log.push(`💥 Boss deals \`${bd}\` → Your HP: \`${Math.max(0, pHp)}\``);
      if (pHp <= 0) break;
      const d = atk(pStats.atk, boss.def); bHp -= d;
      log.push(`⚔️ You deal \`${d}\` → Boss HP: \`${Math.max(0, bHp)}\``);
    }
  }
  return { won: bHp <= 0, log: log.slice(-8) };
};

// Cooldown: 1 hour on fail
const FAIL_COOLDOWN = 60 * 60 * 1000;

module.exports = (bot) => {

  bot.onText(/\/rankup/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const player = getPlayer(userId);
    const world = player.anime || "Demon Slayer";
    const worldData = getWorldData(player);

    const currentRank = worldData.rank || (world === "Solo Leveling" ? "E-Rank" : "Mizunoto");
    const level = worldData.level || 1;
    const nextRank = getNextRank(currentRank, world);

    // Already max rank
    if (!nextRank) {
      return bot.sendMessage(chatId,
        `👑 *You are already at the highest rank!*\n\`${currentRank}\`\n\nYou have reached the peak.`,
        { parse_mode: "Markdown" }
      );
    }

    // Check if eligible
    const eligible = canRankUp(level, currentRank, world);
    if (!eligible) {
      const bosses = RANKUP_BOSSES[world] || {};
      const boss = bosses[nextRank.name];
      const levelNeeded = boss ? "max level for your current rank" : "next tier";
      return bot.sendMessage(chatId,
        `❌ *Not eligible for rank-up yet!*\n\n` +
        `🏅 Current Rank: \`${currentRank}\`\n` +
        `📈 Level: \`${level}\`\n\n` +
        `Reach the max level for \`${currentRank}\` first!`,
        { parse_mode: "Markdown" }
      );
    }

    // Check fail cooldown
    const lastFail = worldData.rankup_fail_time || 0;
    const now = Date.now();
    if ((now - lastFail) < FAIL_COOLDOWN) {
      const minsLeft = Math.ceil((FAIL_COOLDOWN - (now - lastFail)) / 60000);
      return bot.sendMessage(chatId,
        `⏳ *Rank-up cooldown!*\nYou must wait *${minsLeft} more minute(s)* before attempting again.`,
        { parse_mode: "Markdown" }
      );
    }

    const bosses = RANKUP_BOSSES[world] || {};
    const boss = bosses[nextRank.name];

    if (!boss) {
      return bot.sendMessage(chatId, `❌ No rank-up exam found for \`${nextRank.name}\`.`, { parse_mode: "Markdown" });
    }

    const worldEmoji = world === "Solo Leveling" ? "⚡" : "⚔️";

    // Show exam info with confirm button
    bot.sendMessage(chatId,
      `${worldEmoji} *RANK-UP EXAM*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏅 Current Rank: \`${currentRank}\`\n` +
      `👑 Target Rank: \`${nextRank.name}\` ${nextRank.color}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👹 *Exam Boss:* ${boss.name}\n` +
      `❤️ Boss HP: \`${boss.hp}\`\n` +
      `⚔️ Boss ATK: \`${boss.atk}\`\n` +
      `🛡️ Boss DEF: \`${boss.def}\`\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏆 *Rewards on win:*\n` +
      `🪙 \`${boss.reward_coins}\` coins\n` +
      `🧪 \`${boss.reward_xp}\` XP\n` +
      `👑 New rank: \`${nextRank.name}\`\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⚠️ Fail = 1 hour cooldown\n\nAre you ready?`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⚔️ Begin Exam!", callback_data: `rankup_begin:${userId}` },
              { text: "❌ Cancel", callback_data: `rankup_cancel:${userId}` }
            ]
          ]
        }
      }
    );
  });

  // =========================================
  // CALLBACKS
  // =========================================
  bot.on("callback_query", async (query) => {
    if (!query.data.startsWith("rankup_")) return;

    const [action, userId] = query.data.split(":");
    const clickerId = query.from.id.toString();

    if (clickerId !== userId) {
      return bot.answerCallbackQuery(query.id, { text: "❌ Not your exam!", show_alert: true });
    }

    await bot.answerCallbackQuery(query.id);
    await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id
    }).catch(() => {});

    const chatId = query.message.chat.id;

    if (action === "rankup_cancel") {
      return bot.sendMessage(chatId, `❌ Rank-up exam cancelled. Train more and come back!`);
    }

    if (action === "rankup_begin") {
      const player = getPlayer(userId);
      const world = player.anime || "Demon Slayer";
      let worldData = getWorldData(player);
      const currentRank = worldData.rank;
      const nextRank = getNextRank(currentRank, world);

      if (!nextRank) return bot.sendMessage(chatId, `👑 Already max rank!`);

      const boss = (RANKUP_BOSSES[world] || {})[nextRank.name];
      if (!boss) return bot.sendMessage(chatId, `❌ Boss data missing!`);

      const playerStats = getPlayerStats(worldData);
      const result = simulateBattle(playerStats, boss);

      if (result.won) {
        // Rank up!
        const oldRank = currentRank;
        worldData.rank = nextRank.name;

        const xpResult = processXP(worldData, boss.reward_xp, world);
        worldData.level = xpResult.new_level;
        worldData.xp = xpResult.new_xp;
        worldData.xp_needed = require("../asset/solo_leveling/ranks").getXpNeeded(xpResult.new_level, world);
        worldData.rankup_fail_time = 0;

        player.coins = (player.coins || 0) + boss.reward_coins;
        player.battles_won = (player.battles_won || 0) + 1;

        // Add rank-up title
        const titleMap = {
          "Hashira": "Hashira Rank",
          "S-Rank": "S-Rank Hunter",
          "Shadow Monarch": "True Shadow Monarch"
        };
        if (titleMap[nextRank.name]) {
          player.titles = player.titles || [];
          if (!player.titles.includes(titleMap[nextRank.name])) {
            player.titles.push(titleMap[nextRank.name]);
          }
        }

        setWorldData(player, worldData);
        savePlayer(userId, player);

        return bot.sendMessage(chatId,
          `👑 *RANK-UP EXAM — PASSED!*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `You defeated *${boss.name}*!\n\n` +
          `📊 *Battle Log:*\n${result.log.join("\n")}\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🏅 *${oldRank}* → *${nextRank.name}* ${nextRank.color}\n\n` +
          `🏆 *REWARDS:*\n` +
          `🪙 Coins: \`+${boss.reward_coins}\`\n` +
          `🧪 XP: \`+${boss.reward_xp}\`\n` +
          (titleMap[nextRank.name] ? `🏅 Title: \`${titleMap[nextRank.name]}\`\n` : "") +
          `\n🎉 *Congratulations, ${nextRank.name}!*`,
          { parse_mode: "Markdown" }
        );

      } else {
        // Failed
        worldData.rankup_fail_time = Date.now();
        setWorldData(player, worldData);
        savePlayer(userId, player);

        return bot.sendMessage(chatId,
          `💀 *RANK-UP EXAM — FAILED!*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `*${boss.name}* was too powerful!\n\n` +
          `📊 *Battle Log:*\n${result.log.join("\n")}\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `⏳ You can retry in *1 hour*.\n\n` +
          `Train harder with /hunt and come back stronger!`,
          { parse_mode: "Markdown" }
        );
      }
    }
  });
};
