console.log("GUILD FILE LOADED");
const guilds = require("../data/guild");
const players = require("../data/players");

module.exports = (bot) => {

  // =========================
  // SAFE PLAYER INIT
  // =========================
  const getPlayer = (userId) => {
    if (!players[userId]) {
      players[userId] = {
        coins: 1000,
        gems: 0,
        mythicalCrystals: 5,
        level: 1,
        xp: 0
      };
      players.save();
    }
    return players[userId];
  };

  // =========================
  // FIND USER GUILD
  // =========================
  const getUserGuild = (userId) => {
    for (const id in guilds) {
      if (guilds[id].members.includes(userId)) {
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
    const guildName = match[1];

    const player = getPlayer(userId);

    if (getUserGuild(userId)) {
      return bot.sendMessage(chatId, "❌ You are already in a guild.");
    }

    if (player.coins < 100000 || player.mythicalCrystals < 5) {
      return bot.sendMessage(
        chatId,
        "❌ Need 100000 coins + 5 mythical crystals"
      );
    }

    player.coins -= 100000;
    player.mythicalCrystals -= 5;

    guilds[guildName] = {
      name: guildName,
      leader: userId,
      members: [userId],
      maxMembers: 15,
      vault: {
        coins: 0,
        mythicalTokens: 0
      },
      contributions: {}
    };

    players.save();
    guilds.save();

    bot.sendMessage(chatId, `🏰 Guild created: ${guildName}`);
  });

  // =========================
  // JOIN GUILD
  // =========================
  bot.onText(/\/joinguild (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const guildName = match[1];

    if (getUserGuild(userId)) {
      return bot.sendMessage(chatId, "❌ Already in a guild.");
    }

    const guild = guilds[guildName];

    if (!guild) {
      return bot.sendMessage(chatId, "❌ Guild not found.");
    }

    if (guild.members.length >= guild.maxMembers) {
      return bot.sendMessage(chatId, "❌ Guild is full.");
    }

    guild.members.push(userId);
    guilds.save();

    bot.sendMessage(chatId, `✅ Joined guild ${guildName}`);
  });

  // =========================
  // MY GUILD
  // =========================
  bot.onText(/\/myguild/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guild = getUserGuild(userId);

    if (!guild) {
      return bot.sendMessage(chatId, "❌ You are not in a guild.");
    }

    bot.sendPhoto(
      chatId,
      "https://i.pinimg.com/736x/42/cd/c7/42cdc74b49272d2109180b207d9d5892.jpg",
      {
        caption: `🏰 *${guild.name}*

👑 Leader: ${guild.leader}
👥 Members: ${guild.members.length}/${guild.maxMembers}

🏦 Coins: ${guild.vault.coins}
🧬 Tokens: ${guild.vault.mythicalTokens}`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🏆 Guild LB", callback_data: "guild_lb" }
            ],
            [
              { text: "🌐 Guild Guide", url: "https://t.me/DemonSlayer_Corps" }
            ]
          ]
        }
      }
    );
  });

  // =========================
  // DEPOSIT
  // =========================
  bot.onText(/\/deposit (coins|tokens) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const type = match[1];
    const amount = parseInt(match[2]);

    const player = getPlayer(userId);
    const guild = getUserGuild(userId);

    if (!guild) {
      return bot.sendMessage(chatId, "❌ Join a guild first.");
    }

    if (!guild.contributions[userId]) {
      guild.contributions[userId] = {
        coins: 0,
        mythicalTokens: 0
      };
    }

    if (type === "coins") {
      if (player.coins < amount) {
        return bot.sendMessage(chatId, "❌ Not enough coins.");
      }

      player.coins -= amount;
      guild.vault.coins += amount;
      guild.contributions[userId].coins += amount;
    }

    if (type === "tokens") {
      if (player.mythicalCrystals < amount) {
        return bot.sendMessage(chatId, "❌ Not enough tokens.");
      }

      player.mythicalCrystals -= amount;
      guild.vault.mythicalTokens += amount;
      guild.contributions[userId].mythicalTokens += amount;
    }

    players.save();
    guilds.save();

    bot.sendMessage(chatId, `✅ Deposited ${amount} ${type}`);
  });

  // =========================
  // UPGRADE GUILD
  // =========================
  bot.onText(/\/upgradeguild/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guild = getUserGuild(userId);

    if (!guild) {
      return bot.sendMessage(chatId, "❌ No guild found.");
    }

    if (guild.leader !== userId) {
      return bot.sendMessage(chatId, "❌ Only leader can upgrade.");
    }

    if (guild.maxMembers >= 25) {
      return bot.sendMessage(chatId, "❌ Already max upgraded.");
    }

    if (guild.vault.mythicalTokens < 150) {
      return bot.sendMessage(chatId, "❌ Need 150 guild tokens.");
    }

    guild.vault.mythicalTokens -= 150;
    guild.maxMembers = 25;

    guilds.save();

    bot.sendMessage(chatId, "🏰 Guild upgraded to 25 members!");
  });

};
