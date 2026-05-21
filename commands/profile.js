console.log("✅ PROFILE SYSTEM LOADED");

const fs = require("fs");
const path = require("path");

const playerFile = path.join(__dirname, "../data/players.json");

// LOAD DATA SAFELY
let players = {};
try { players = JSON.parse(fs.readFileSync(playerFile, "utf8")); } catch { players = {}; }

// SAVE DATA SAFELY
const savePlayers = () => fs.writeFileSync(playerFile, JSON.stringify(players, null, 2));

module.exports = (bot) => {

  bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const user = msg.from;

    // Reload database live to capture fresh combat/economy entries
    try { 
      players = JSON.parse(fs.readFileSync(playerFile, "utf8")); 
    } catch { 
      players = {}; 
    }

    // SAFE USER INIT (Synced completely with economy and battle files)
    if (!players[userId]) {
      players[userId] = {
        coins: 1000,
        tokens: 0, // Bank balance
        level: 1,
        xp: 0,
        guildId: null,
        lastDaily: 0,
        mythicalCrystals: 5,
        rank: "Mizunoto (Rookie)",
        character: "Not Selected"
      };
      savePlayers();
    }

    const p = players[userId];

    // Safeguards for missing profile elements on old accounts
    if (p.rank === undefined) p.rank = "Mizunoto (Rookie)";
    if (p.character === undefined) p.character = "Not Selected";
    if (p.mythicalCrystals === undefined) p.mythicalCrystals = 5;
    if (p.tokens === undefined) p.tokens = 0;

    // Dynamic rank name updating based on level milestones
    if (p.level >= 5 && p.level < 10) p.rank = "Kanoe";
    if (p.level >= 10 && p.level < 20) p.rank = "Hashira Apprentice";
    if (p.level >= 20) p.rank = "🩸 Demon Hashira";

    // =========================
    // BACKGROUND IMAGE
    // =========================
    const bg = "https://i.pinimg.com/736x/9b/35/e8/9b35e852f18742bc03131e623615ff94.jpg"; 

    // =========================
    // TEXT OVERLAY USING CAPTION
    // =========================
    const xpNeeded = p.level * 100;
    const caption = 
`⚔️ **DEMON SLAYER PROFILE** ⚔️

👤 **Slayer:** ${user.first_name}
📊 **Level:** ${p.level}  *(✨ ${p.xp} / ${xpNeeded} XP)*
🏆 **Rank:** ${p.rank}
⛩️ **Character:** ${p.character}

━━━━━━━━━━━━━━━━━━━
👛 **Wallet:** ${p.coins} coins
🏦 **Bank:** ${p.tokens} tokens
🧬 **Crystals:** ${p.mythicalCrystals} Mythical

🔥 *Type /battle to slay demons and grow stronger!*`;

    try {
      await bot.sendPhoto(chatId, bg, {
        caption: caption,
        parse_mode: "Markdown"
      });
    } catch (err) {
      console.log("Profile photo render issue:", err);
      bot.sendMessage(chatId, "❌ Profile load nahi hua 😓. Checking system...");
    }
  });

};
