console.log("⚔️ INTERACTIVE BUTTON-BASED PROFILE SYSTEM ONLINE (VELIX OS V2)");

const fs = require("fs");
const path = require("path");

// Secure DB Path Resolution
const dataDir = path.join(__dirname, "../data");
const playerFile = path.join(dataDir, "players.json");
const guildFile = path.join(dataDir, "guild.json");

// Helper to safely read databases without crashing
const safeReadJSON = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (e) {
    console.error(`⚠️ DB read warning:`, e.message);
  }
  return {};
};

module.exports = (bot) => {
  
  // 1. MAIN PROFILE COMMAND WITH BUTTONS
  bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const username = msg.from.first_name || "VELIX";

    const players = safeReadJSON(playerFile);
    const guilds = safeReadJSON(guildFile);

    const stats = players[userId] || { coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, characters: [] };
    const userGuild = stats.guildId && guilds[stats.guildId] ? guilds[stats.guildId].name : "No Guild Joined";

    // 🖼️ AAPKI IMAGE URL
    const profileImageUrl = "https://i.pinimg.com/736x/52/f5/97/52f597b5ed03c1f59f54aa656be46c7d.jpg";

    const mainCaption = 
`⚔️ **SLAYER MAIN PROFILE**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **NAME :** \`${username.toUpperCase()}\`
🆔 **ID   :** \`${userId}\`
🏰 **GUILD:** \`${userGuild}\`
━━━━━━━━━━━━━━━━━━━━━━━━
📈 **RANK LEVEL :** \`Lvl ${stats.level}\`
🧪 **EXPERIENCE :** \`${stats.xp} XP\`
━━━━━━━━━━━━━━━━━━━━━━━━
*Neeche diye gaye buttons use karke apni inventory aur characters check karo!*`;

    try {
      await bot.sendPhoto(chatId, profileImageUrl, {
        caption: mainCaption,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🎒 Inventory & Tokens", callback_data: `inv_${userId}` },
              { text: "👑 Characters", callback_data: `char_${userId}` }
            ],
            [
              { text: "🏰 Guild Details", callback_data: `gld_${userId}` },
              { text: "🔄 Main Menu", callback_data: `main_${userId}` }
            ]
          ]
        }
      });
    } catch (err) {
      console.error("🔥 Profile Delivery Failed:", err.message);
    }
  });

  // 2. BUTTON CLICKS LISTENER (CALLBACK QUERIES)
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;
    const clickerId = query.from.id.toString();

    // Splitting data to verify user (Security check taaki koi dusra aapke button pe click na kare)
    const [action, targetUserId] = data.split("_");

    if (clickerId !== targetUserId) {
      return bot.answerCallbackQuery(query.id, {
        text: "❌ Yeh profile aapki nahi hai! Apna /profile check karein.",
        show_alert: true
      });
    }

    const players = safeReadJSON(playerFile);
    const guilds = safeReadJSON(guildFile);
    const stats = players[targetUserId] || { coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, characters: [] };
    const username = query.from.first_name || "VELIX";

    let updatedCaption = "";

    // Action handling
    if (action === "inv") {
      updatedCaption = 
`🎒 **SLAYER INVENTORY**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **OWNER:** \`${username.toUpperCase()}\`
━━━━━━━━━━━━━━━━━━━━━━━━
💰 **SLAYER COINS :** \`${stats.coins} 🪙\`
💎 **SLAYER TOKENS:** \`${stats.tokens || 0} 🎴\`

*Tokens ka use aap shop se premium items card packs khareedne ke liye kar sakte hain!*`;

    } else if (action === "char") {
      const charList = stats.characters && stats.characters.length > 0 
        ? stats.characters.map((c, i) => `${i + 1}. 🃏 \`${c}\``).join("\n")
        : "_Koi character card nahi mila. Cards generate ya trade karo!_";

      updatedCaption = 
`👑 **MY CHARACTERS COLLECTION**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **OWNER:** \`${username.toUpperCase()}\`
📊 **TOTAL:** \`${stats.characters ? stats.characters.length : 0} Cards\`
━━━━━━━━━━━━━━━━━━━━━━━━
${charList}
━━━━━━━━━━━━━━━━━━━━━━━━`;

    } else if (action === "gld") {
      const hasGuild = stats.guildId && guilds[stats.guildId];
      const guildName = hasGuild ? guilds[stats.guildId].name : "No Guild Joined";
      const guildLeader = hasGuild ? (guilds[stats.guildId].leader || "Unknown") : "None";
      const guildMembers = hasGuild && guilds[stats.guildId].members ? guilds[stats.guildId].members.length : 0;

      updatedCaption = 
`🏰 **GUILD ASSOCIATION DATA**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **PLAYER :** \`${username.toUpperCase()}\`
━━━━━━━━━━━━━━━━━━━━━━━━
🏰 **GUILD NAME :** \`${guildName}\`
👑 **LEADER     :** \`${guildLeader}\`
👥 **MEMBERS    :** \`${guildMembers} Slayers\`

*Guild quests poori karke clan level up karo!*`;

    } else if (action === "main") {
      const userGuild = stats.guildId && guilds[stats.guildId] ? guilds[stats.guildId].name : "No Guild Joined";
      updatedCaption = 
`⚔️ **SLAYER MAIN PROFILE**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **NAME :** \`${username.toUpperCase()}\`
🆔 **ID   :** \`${targetUserId}\`
🏰 **GUILD:** \`${userGuild}\`
━━━━━━━━━━━━━━━━━━━━━━━━
📈 **RANK LEVEL :** \`Lvl ${stats.level}\`
🧪 **EXPERIENCE :** \`${stats.xp} XP\`
━━━━━━━━━━━━━━━━━━━━━━━━
*Neeche diye gaye buttons use karke apni inventory aur characters check karo!*`;
    }

    try {
      // Edit caption dynamically without deleting or re-sending image!
      await bot.editMessageCaption(updatedCaption, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🎒 Inventory & Tokens", callback_data: `inv_${targetUserId}` },
              { text: "👑 Characters", callback_data: `char_${targetUserId}` }
            ],
            [
              { text: "🏰 Guild Details", callback_data: `gld_${targetUserId}` },
              { text: "🔄 Main Menu", callback_data: `main_${targetUserId}` }
            ]
          ]
        }
      });
      // Acknowledge the click to remove loading animation on button
      bot.answerCallbackQuery(query.id);
    } catch (err) {
      console.error("🔥 Button Action Failed:", err.message);
    }
  });
};
