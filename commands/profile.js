/**
 * VELIX OS V2.5 | STRICT SECURITY PROFILE HUB [ENGLISH VERSION]
 * Fully Integrated with Centralized Ledger Architecture
 * Concurrency Proof (2000+ Active Users)
 *
 * 🔧 FIXED (by Claude):
 *  1) sanitizeStats + buildMainCaption now read "xp" (matches core/index.js),
 *     so the profile actually shows real experience instead of always 0.
 *  2) callback_query filter is now strict (^(main|inv|char|gld)_), so this
 *     handler no longer fires on battle_attack_/battle_run_ buttons and
 *     spams the "not your dashboard" alert during combat.
 */

const fs = require("fs");
const path = require("path");
const guildFile = path.join(process.cwd(), "data", "guild.json");

const PROFILE_PHOTO = "https://i.pinimg.com/736x/52/f5/97/52f597b5ed03c1f59f54aa656be46c7d.jpg";

// Safe Read for Guild Data only (Player data handles via Core Ledger Engine)
const safeReadGuilds = () => {
  try { 
    if (fs.existsSync(guildFile)) return JSON.parse(fs.readFileSync(guildFile, "utf8")); 
  } catch (e) {
    console.error("❌ Guild read mismatch:", e.message);
  }
  return {};
};

// Centralized Sanitize Matrix ensuring data safety layers
const sanitizeStats = (s) => {
  let stats = s || {};
  return {
    coins: Math.max(0, parseInt(stats.coins) || 0),
    bank: Math.max(0, parseInt(stats.bank) || 0),
    crystals: Math.max(0, parseInt(stats.crystals) || 0),
    mythic: Math.max(0, parseInt(stats.mythic) || 0),
    level: Math.max(1, parseInt(stats.level) || 1),
    xp: Math.max(0, parseInt(stats.xp) || 0), // 🔧 FIXED: was stats.exp
    guildId: stats.guildId || null,
    inventory: Array.isArray(stats.inventory) ? stats.inventory : (stats.owned_characters || []),
    materials: stats.materials && typeof stats.materials === 'object' ? stats.materials : {},
    active_task: stats.active_task || null
  };
};

// Helper function to build Main Dashboard Layout
const buildMainCaption = (username, stats, userGuild) => {
  let taskText = "\n_No active mission. Type /task to assign one!_";
  if (stats.active_task) {
    const t = stats.active_task;
    const statusIcon = t.completed ? "✅" : "⏳";
    taskText = `\n📜 **Mission:** ${t.desc}\n📊 **Progress:** [${t.progress}/${t.target}] ${statusIcon}`;
  }

  return `⚔️ **VELIX OS | SLAYER PROFILE HUB**
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 **NAME:** \`${username.toUpperCase()}\`
🏰 **GUILD:** \`${userGuild}\`

📈 **RANK STATUS:**
├ 🔺 **Slayer Level:** \`Tier ${stats.level}\`
└ 🧪 **Experience:** \`${stats.xp} XP\`

💰 **ASSET WALLET:**
├ 🪙 **Crow Coins:** \`${stats.coins.toLocaleString()}\`
├ 🏦 **Corps Vault:** \`${stats.bank.toLocaleString()}\`
├ 💎 **Crystals:** \`${stats.crystals.toLocaleString()}\`
└ ✨ **Mythic Tokens:** \`${stats.mythic.toLocaleString()}\`

📋 **DAILY MISSION EXPEDITION:**${taskText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🦅 *Keep ascending your breathing style forms.*`;
};

module.exports = (bot) => {
  
  // Command: /profile
  bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString(); 
    
    // Core Engine Centralized Data Fetch
    const rawPlayer = bot.getPlayerData(userId);
    const guilds = safeReadGuilds();
    
    const stats = sanitizeStats(rawPlayer);
    const userGuild = stats.guildId && guilds[stats.guildId] ? guilds[stats.guildId].name : "No Guild Joined";

    const mainCaption = buildMainCaption(msg.from.first_name, stats, userGuild);

    try {
      await bot.sendPhoto(chatId, PROFILE_PHOTO, {
        caption: mainCaption, 
        parse_mode: "Markdown",
        reply_markup: { 
          inline_keyboard: [
            [{ text: "🎒 Inventory Bag", callback_data: `inv_${userId}` }, { text: "👑 Card Roster", callback_data: `char_${userId}` }], 
            [{ text: "🏰 Guild Center", callback_data: `gld_${userId}` }, { text: "🔄 Refresh Hub", callback_data: `main_${userId}` }]
          ] 
        }
      });
    } catch (err) {
      console.error("❌ Profile layout push dropped:", err.message);
    }
  });

  // Inline Button Click Handler with Strict Security Lock
  bot.on("callback_query", async (query) => {
    // 🔧 FIXED: strict prefix match instead of "includes('_')"
    // Old code matched ANY callback_data containing "_" (e.g. battle_attack_123),
    // which caused this handler to fire on battle buttons too and show a
    // false "not your dashboard" alert during combat.
    if (!/^(main|inv|char|gld)_/.test(query.data)) return;

    const [action, targetUserId] = query.data.split("_");
    const clickerId = query.from.id.toString(); 

    // 🔥 SECURITY SHIELD: Blocks external clicks completely 
    if (clickerId !== targetUserId) {
      return bot.answerCallbackQuery(query.id, { 
        text: "🏮 This is not your personal dashboard! Run /profile to deploy your own dashboard panel.", 
        show_alert: true 
      });
    }

    // Dynamic Central Sync to pull latest data updates
    const rawPlayer = bot.getPlayerData(targetUserId);
    const guilds = safeReadGuilds();
    
    const stats = sanitizeStats(rawPlayer);
    const userGuild = stats.guildId && guilds[stats.guildId] ? guilds[stats.guildId].name : "No Guild Joined";
    let updatedCaption = "";

    if (action === "main") {
      updatedCaption = buildMainCaption(query.from.first_name, stats, userGuild);
    } 
    else if (action === "inv") {
      let essenceEntries = Object.entries(stats.materials).filter(([_, count]) => (parseInt(count) || 0) > 0);
      let materialText = "";

      if (essenceEntries.length === 0) {
        materialText = "_Your item bags are completely empty! Pull duplicate slayers to extract components._";
      } else {
        materialText = essenceEntries.map(([key, value]) => `• 🧪 **${key.replace('_', ' ').toUpperCase()}:** \`${value}\` pcs`).join("\n");
      }

      updatedCaption = `🎒 **VELIX OS | STORAGE BAG**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${materialText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 *Use these character essences to unleash rank ascension via /upgrade.*`;
    }
    else if (action === "char") {
      let characterText = "";

      if (stats.inventory.length === 0) {
        characterText = "_No slayers recruited yet! Use the summoning system to extract rare warrior units._";
      } else {
        characterText = stats.inventory.map((item, idx) => {
          let cName = typeof item === "string" ? item : (item.name || "Unknown Slayer");
          let cLevel = typeof item === "string" ? 1 : (parseInt(item.level) || 1);
          let levelStars = "⭐".repeat(Math.min(5, cLevel));
          let powerMetric = cLevel * 150;

          return `\`${idx + 1}.\` 👤 **${cName}**\n     ┗ 💠 [Lv. ${cLevel}] ${levelStars} | ⚡ \`${powerMetric} CP\``;
        }).join("\n\n");
      }

      updatedCaption = `👑 **VELIX OS | WARRIOR ROSTER**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${characterText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 *To ascend any character rank: Type \`/upgrade <name>\` in chat.*`;
    }
    else if (action === "gld") {
      updatedCaption = `🏰 **VELIX OS | GUILD HUB**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔹 **Current Faction:** \`${userGuild}\`\n🔹 **Guild Hex ID:** \`${stats.guildId || "None"}\`\n\n_Cooperate with your guild alliance members to unlock massive vault multiplier milestones!_`;
    }

    try {
      await bot.editMessageCaption(updatedCaption, { 
        chat_id: query.message.chat.id, 
        message_id: query.message.message_id, 
        parse_mode: "Markdown",
        reply_markup: { 
          inline_keyboard: [
            [{ text: "🎒 Inventory Bag", callback_data: `inv_${targetUserId}` }, { text: "👑 Card Roster", callback_data: `char_${targetUserId}` }], 
            [{ text: "🏰 Guild Center", callback_data: `gld_${targetUserId}` }, { text: "🔄 Main Hub", callback_data: `main_${targetUserId}` }]
          ] 
        }
      });
    } catch (err) {
      console.log("⚠️ Interface layout refresh skipped (No structural updates).");
    }
    
    bot.answerCallbackQuery(query.id);
  });
};
