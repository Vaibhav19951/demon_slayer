console.log("💰 AUTOMATED REPLY & TAG ECONOMY SYSTEM LOADED");

const fs = require("fs");
const path = require("path");

const playerFile = path.join(__dirname, "../data/players.json");
const guildFile = path.join(__dirname, "../data/guild.json");

// FILE HANDLING LAYER WITH FRESH ON-DEMAND LOCKS
const loadPlayersData = () => {
  try { return JSON.parse(fs.readFileSync(playerFile, "utf8")); } catch (e) { return {}; }
};

const savePlayersData = (data) => {
  fs.writeFileSync(playerFile, JSON.stringify(data, null, 2));
};

const loadGuildsData = () => {
  try { return JSON.parse(fs.readFileSync(guildFile, "utf8")); } catch (e) { return {}; }
};

const saveGuildsData = (data) => {
  fs.writeFileSync(guildFile, JSON.stringify(data, null, 2));
};

// USER AUTO-INITIALIZATION ENGINE
const getUser = (currentPlayers, userId, msg) => {
  if (!currentPlayers[userId]) {
    currentPlayers[userId] = {
      coins: 1000,
      tokens: 0, 
      level: 1,
      xp: 0,
      guildId: null,
      lastDaily: 0,
      username: ""
    };
  }
  // Auto-sync usernames when interacting with the economy system
  if (msg && msg.from && msg.from.username) {
    currentPlayers[userId].username = msg.from.username;
  }
  return currentPlayers[userId];
};

// GUILD INITIALIZATION ENGINE
const getGuild = (currentGuilds, guildId) => {
  if (!currentGuilds[guildId]) {
    currentGuilds[guildId] = {
      name: "Unknown Guild",
      bank: 0
    };
  }
  return currentGuilds[guildId];
};

module.exports = (bot) => {

  // ==========================================
  // 💰 NEW: /pay [REPLY & TAG ENABLED ECONOMY PIPELINE]
  // ==========================================
  bot.onText(/\/pay(?: (.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id.toString();
    const senderName = msg.from.first_name;
    const rawInput = match[1] || "";

    let receiverId = null;
    let amountStr = null;

    // METHOD A: AGAR SENDER NE KISI KE MESSAGE PAR REPLY KIYA HAI
    if (msg.reply_to_message) {
      receiverId = msg.reply_to_message.from.id.toString();
      amountStr = rawInput.replace("|", "").trim();
    } 
    // METHOD B: AGAR USER NE KISI KO TAG KIYA HAI (Format: /pay @username | 500)
    else {
      const parts = rawInput.split("|");
      if (parts.length < 2) {
        return bot.sendMessage(
          chatId,
          "💡 **Coins Transfer Kaise Karein?**\n\n1. Dost ke message par **Reply** karke likho:\n   `/pay 500`\n\n2. Ya fir group mein unhe **Tag** karke likho:\n   `/pay @username | 500`",
          { parse_mode: "Markdown" }
        );
      }

      const targetTag = parts[0].trim().replace("@", "").toLowerCase();
      amountStr = parts[1].trim();

      const currentPlayers = loadPlayersData();
      receiverId = Object.keys(currentPlayers).find(id => 
        currentPlayers[id].username && currentPlayers[id].username.toLowerCase() === targetTag
      );

      if (!receiverId) {
        return bot.sendMessage(chatId, `❌ Username \`@${targetTag}\` database mein nahi mila! Unse kahein ki ek baar \`/profile\` ya \`/start\` run karein.`);
      }
    }

    // Validation checks
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      return bot.sendMessage(chatId, "❌ Please specify a valid positive number amount of coins to transfer!");
    }

    if (senderId === receiverId) {
      return bot.sendMessage(chatId, "⚠️ Aap khud ko coins transfer nahi kar sakte, Slayer!");
    }

    const currentPlayers = loadPlayersData();
    const senderProfile = getUser(currentPlayers, senderId, msg);

    if (senderProfile.coins < amount) {
      return bot.sendMessage(chatId, `❌ Transaction Failed!\nAapke paas paryapt coins nahi hain. Balance: 💰 **${senderProfile.coins.toLocaleString()}** coins.`);
    }

    // Target check
    const receiverProfile = getUser(currentPlayers, receiverId, msg.reply_to_message || null);

    // Sync names safely
    if (msg.reply_to_message && msg.reply_to_message.from.username) {
      receiverProfile.username = msg.reply_to_message.from.username;
    }

    // TRANSACTIONS EXECUTION
    senderProfile.coins -= amount;
    receiverProfile.coins += amount;

    savePlayersData(currentPlayers);

    let receiverDisplayName = "Slayer";
    if (msg.reply_to_message) {
      receiverDisplayName = msg.reply_to_message.from.first_name;
    } else {
      receiverDisplayName = `@${rawInput.split("|")[0].trim().replace("@", "")}`;
    }

    bot.sendMessage(
      chatId,
      `💸 **ECONOMY TRANSACTION SUCCESSFUL** 💸\n\n📤 **Sender:** ${senderName}\n📥 **Receiver:** ${receiverDisplayName}\n\n💰 **Transferred Amount:** \`${amount.toLocaleString()}\` Coins\n\n🔋 *Database balances successfully synchronized!*`,
      { parse_mode: "Markdown" }
    );
  });

  // ==========================================
  // 1. BALANCE COMMAND (UPDATED)
  // ==========================================
  bot.onText(/\/balance/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    const currentPlayers = loadPlayersData();
    const p = getUser(currentPlayers, userId, msg);
    savePlayersData(currentPlayers);

    const text = `⚔️ *Slayer Inventory* ⚔️\n\n👛 *Wallet:* ${p.coins.toLocaleString()} coins\n🏦 *Bank:* ${p.tokens.toLocaleString()} tokens`;
    bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  });

  // ==========================================
  // 2. DAILY REWARD COMMAND (UPDATED)
  // ==========================================
  bot.onText(/\/daily/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    const currentPlayers = loadPlayersData();
    const p = getUser(currentPlayers, userId, msg);

    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; 

    if (p.lastDaily && now - p.lastDaily < cooldown) {
      const timeLeft = cooldown - (now - p.lastDaily);
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minsLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return bot.sendMessage(chatId, `⏳ You already claimed your daily reward! Come back in *${hoursLeft}h ${minsLeft}m*.`, { parse_mode: "Markdown" });
    }

    const reward = 500;
    p.coins += reward;
    p.lastDaily = now;
    
    savePlayersData(currentPlayers);

    bot.sendMessage(chatId, `🎁 *Daily Reward!* You claimed *${reward} coins*!`, { parse_mode: "Markdown" });
  });

  // ==========================================
  // 3. WORK COMMAND (UPDATED)
  // ==========================================
  bot.onText(/\/work/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    const currentPlayers = loadPlayersData();
    const p = getUser(currentPlayers, userId, msg);

    const jobs = [
      "You trained hard with the Water Hashira",
      "You helped the Butterfly Mansion clean medical supplies",
      "You assisted Haganezuka in polishing swords",
      "You defeated a minor demon lurking in the woods"
    ];

    const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
    const earnings = Math.floor(Math.random() * 150) + 50; 

    p.coins += earnings;
    savePlayersData(currentPlayers);

    bot.sendMessage(chatId, `💼 *Work:* ${randomJob} and earned *${earnings} coins*!`, { parse_mode: "Markdown" });
  });

  // ==========================================
  // 4. PLAYER DEPOSIT (BANK) (UPDATED)
  // ==========================================
  bot.onText(/\/deposit(?: (.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    const currentPlayers = loadPlayersData();
    const p = getUser(currentPlayers, userId, msg);

    let amountInput = match[1];

    if (!amountInput) {
      return bot.sendMessage(chatId, "ℹ️ Please specify an amount to deposit. Example: `/deposit 100` or `/deposit all`", { parse_mode: "Markdown" });
    }

    amountInput = amountInput.toLowerCase().replace(/coins|coin/g, "").trim();

    let amount = 0;
    if (amountInput === "all") {
      amount = p.coins;
    } else {
      amount = Number(amountInput);
    }

    if (isNaN(amount) || amount <= 0) {
      return bot.sendMessage(chatId, "❌ Invalid amount! Please provide a valid number.");
    }

    if (p.coins < amount) {
      return bot.sendMessage(chatId, "❌ Not enough coins in your wallet!");
    }

    p.coins -= amount;
    p.tokens += amount;
    savePlayersData(currentPlayers);

    bot.sendMessage(chatId, `🏦 Success! Deposited *${amount.toLocaleString()} coins* to your bank account.`, { parse_mode: "Markdown" });
  });

  // ==========================================
  // 5. GUILD DEPOSIT (UPDATED)
  // ==========================================
  bot.onText(/\/guilddeposit(?: (.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    const currentPlayers = loadPlayersData();
    const p = getUser(currentPlayers, userId, msg);

    let amountInput = match[1];

    if (!amountInput) {
      return bot.sendMessage(chatId, "ℹ️ Please specify an amount to deposit to your guild. Example: `/guilddeposit 100`", { parse_mode: "Markdown" });
    }

    if (!p.guildId) {
      return bot.sendMessage(chatId, "❌ You are not in a guild");
    }

    const currentGuilds = loadGuildsData();
    const g = getGuild(currentGuilds, p.guildId);
    
    amountInput = amountInput.toLowerCase().replace(/coins|coin/g, "").trim();
    let amount = Number(amountInput);

    if (isNaN(amount) || amount <= 0) {
      return bot.sendMessage(chatId, "❌ Invalid amount");
    }

    if (p.coins < amount) {
      return bot.sendMessage(chatId, "❌ Not enough coins");
    }

    p.coins -= amount;
    g.bank += amount;

    savePlayersData(currentPlayers);
    saveGuildsData(currentGuilds);

    bot.sendMessage(
      chatId,
      `🏰 *Guild Deposit Successful!*\n💰 +${amount.toLocaleString()} coins added to guild bank\n🏦 Guild Bank: ${g.bank.toLocaleString()}`,
      { parse_mode: "Markdown" }
    );
  });

};
