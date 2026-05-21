console.log("✅ GUILD FILE LOADED WITH VAULT AND AUTO-RECOVERY");

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../data");
const playerFile = path.join(dataDir, "players.json");
const guildFile = path.join(dataDir, "guild.json");

// ==========================================
// SAFE DIRECTORY & FILE INITIALIZATION
// ==========================================
try {
  // Agar 'data' folder nahi hai toh banao
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("📁 'data' folder created automatically.");
  }
  
  // Agar 'players.json' nahi hai toh khali object ke sath banao
  if (!fs.existsSync(playerFile)) {
    fs.writeFileSync(playerFile, JSON.stringify({}), "utf8");
    console.log("📄 'players.json' created automatically.");
  }

  // Agar 'guild.json' nahi hai toh khali object ke sath banao
  if (!fs.existsSync(guildFile)) {
    fs.writeFileSync(guildFile, JSON.stringify({}), "utf8");
    console.log("📄 'guild.json' created automatically.");
  }
} catch (err) {
  console.error("❌ Error setting up data files:", err.message);
}

// LOAD DATA SAFELY
let players = {};
let guilds = {};

try { players = JSON.parse(fs.readFileSync(playerFile, "utf8")); } catch { players = {}; }
try { guilds = JSON.parse(fs.readFileSync(guildFile, "utf8")); } catch { guilds = {}; }

// SAVE DATA SAFELY
const savePlayers = () => fs.writeFileSync(playerFile, JSON.stringify(players, null, 2));
const saveGuilds = () => fs.writeFileSync(guildFile, JSON.stringify(guilds, null, 2));

module.exports = (bot) => {

  // =========================
  // SAFE PLAYER INIT
  // =========================
  const getPlayer = (userId) => {
    if (!players[userId]) {
      players[userId] = {
        coins: 1000,
        tokens: 0, 
        level: 1,
        xp: 0,
        guildId: null,
        mythicalCrystals: 5 
      };
      savePlayers();
    }
    if (players[userId].mythicalCrystals === undefined) {
      players[userId].mythicalCrystals = 5;
      savePlayers();
    }
    return players[userId];
  };

  // =========================
  // FIND USER GUILD
  // =========================
  const getUserGuild = (userId) => {
    for (const id in guilds) {
      if (
        guilds[id] &&
        Array.isArray(guilds[id].members) &&
        guilds[id].members.includes(userId)
      ) {
        return guilds[id];
      }
    }
    return null;
  };

  // =========================
  // CREATE GUILD
  // =========================
  bot.onText(/\/createguild (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const guildName = match[1].trim();

    const player = getPlayer(userId);

    if (getUserGuild(userId)) {
      return bot.sendMessage(chatId, "❌ You are already in a guild.");
    }

    if (guilds[guildName]) {
      return bot.sendMessage(chatId, "❌ A guild with that name already exists!");
    }

    if (player.coins < 10000 || player.mythicalCrystals < 5) {
      return bot.sendMessage(
        chatId,
        `❌ You don't have enough resources!\nRequired: 10,000 coins + 5 mythical crystals.\nYour Balance: ${player.coins} coins, ${player.mythicalCrystals} crystals.`
      );
    }

    player.coins -= 10000;
    player.mythicalCrystals -= 5;
    player.guildId = guildName; 

    guilds[guildName] = {
      name: guildName,
      leader: userId,
      leaderName: msg.from.first_name,
      members: [userId],
      maxMembers: 15,
      vault: {
        coins: 0,
        mythicalTokens: 0
      },
      glory: 0,
      guildTokens: 0,
      rewardClaimed: {
        2000: false,
        4000: false,
        6000: false,
        8000: false
      }
    };

    savePlayers();
    saveGuilds();

    bot.sendAnimation(
      chatId,
      "https://i.pinimg.com/originals/e1/4c/bd/e14cbd36263f5061b3e3d1284dd27168.gif",
      {
        caption: `🏰 **Guild Created Successfully!**\n\n🏷 **Name:** ${guildName}\n👑 **Leader:** ${msg.from.first_name}\n👥 **Capacity:** 15 Members`
      }
    );
  });

  // =========================
  // JOIN GUILD
  // =========================
  bot.onText(/\/joinguild (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const guildName = match[1].trim();
    const player = getPlayer(userId);

    if (getUserGuild(userId)) {
      return bot.sendMessage(chatId, "❌ Already in a guild.");
    }

    const guild = guilds[guildName];

    if (!guild) {
      return bot.sendMessage(chatId, "❌ Guild not found. Make sure spelling matches exactly.");
    }

    if (guild.members.includes(userId)) {
      return bot.sendMessage(chatId, "❌ You are already a member of this guild.");
    }

    if (guild.members.length >= guild.maxMembers) {
      return bot.sendMessage(chatId, "❌ This guild is full.");
    }

    guild.members.push(userId);
    player.guildId = guildName; 

    saveGuilds();
    savePlayers();

    bot.sendMessage(chatId, `✅ Success! You have joined the guild **${guildName}**.`);
  });

  // =========================
  // MY GUILD
  // =========================
  bot.onText(/\/myguild/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guild = getUserGuild(userId);

    if (!guild) {
      return bot.sendMessage(chatId, "❌ You are not in any guild. Use `/createguild [name]` or `/joinguild [name]`.");
    }

    bot.sendAnimation(
      chatId,
      "https://i.pinimg.com/originals/1e/e0/e1/1ee0e17a9a4eadecb93890878164dbdb.gif",
      {
        caption: `🏰 *Guild Profile: ${guild.name}*\n\n👑 *Leader:* ${guild.leaderName || "Unknown Slayer"}\n👥 *Members:* ${guild.members.length}/${guild.maxMembers}\n\n🏆 *Glory Points:* ${guild.glory}\n🏅 *Guild Tokens:* ${guild.guildTokens}\n\n🏦 *Vault Balance:* ${guild.vault.coins} coins\n🧬 *Vault Crystals:* ${guild.vault.mythicalTokens}`,
        parse_mode: "Markdown"
      }
    );
  });

  // =========================
  // GUILD VAULT DEPOSIT
  // =========================
  bot.onText(/\/guildvault(?: (.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const player = getPlayer(userId);
    const guild = getUserGuild(userId);

    if (!guild) {
      return bot.sendMessage(chatId, "❌ You must be part of a guild to deposit items into the vault.");
    }

    let amountInput = match[1];

    if (!amountInput) {
      return bot.sendMessage(chatId, "ℹ️ Specify an amount to deposit to your guild vault.\nExample: `/guildvault 500` or `/guildvault all`", { parse_mode: "Markdown" });
    }

    amountInput = amountInput.toLowerCase().replace(/coins|coin/g, "").trim();

    let amount = 0;
    if (amountInput === "all") {
      amount = player.coins;
    } else {
      amount = Number(amountInput);
    }

    if (isNaN(amount) || amount <= 0) {
      return bot.sendMessage(chatId, "❌ Invalid amount! Please enter a real number.");
    }

    if (player.coins < amount) {
      return bot.sendMessage(chatId, "❌ You do not have enough coins in your personal wallet!");
    }

    player.coins -= amount;
    guild.vault.coins += amount;

    savePlayers();
    saveGuilds();

    bot.sendMessage(
      chatId, 
      `🏰 **Vault Deposit Success!**\n💰 You contributed **${amount} coins** to the **${guild.name}** vault!\n🏦 **Total Vault Balance:** ${guild.vault.coins} coins`,
      { parse_mode: "Markdown" }
    );
  });

  // =========================
  // UPGRADE GUILD
  // =========================
  bot.onText(/\/upgradeguild/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guild = getUserGuild(userId);

    if (!guild) {
      return bot.sendMessage(chatId, "❌ Guild not found.");
    }

    if (guild.leader !== userId) {
      return bot.sendMessage(chatId, "❌ Only the Guild Leader can upgrade the capacity.");
    }

    if (guild.maxMembers >= 25) {
      return bot.sendMessage(chatId, "❌ Your guild is already at maximum upgrade level (25 members).");
    }

    if (guild.guildTokens < 20) {
      return bot.sendMessage(chatId, `❌ Not enough tokens! You need 20 Guild Tokens to upgrade. Your guild has: ${guild.guildTokens}`);
    }

    guild.guildTokens -= 20;
    guild.maxMembers = 25;

    saveGuilds();

    bot.sendMessage(chatId, `🏰 **Guild Level Up!** Max member capacity increased to **25 members**!`);
  });

};
