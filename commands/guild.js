const players = require("../data/players");
const guilds = require("../data/guilds");

module.exports = (bot) => {

  // =========================
  // FIND GUILD
  // =========================
  const getUserGuild = (userId) => {
    for (let g in guilds) {
      if (guilds[g].members.includes(userId)) {
        return guilds[g];
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
    const name = match[1];

    const p = players[userId];
    if (!p) return bot.sendMessage(chatId, "❌ Profile not found");

    if (getUserGuild(userId)) {
      return bot.sendMessage(chatId, "❌ Already in a guild");
    }

    if (p.coins < 100000 || p.mythicalCrystals < 5) {
      return bot.sendMessage(chatId, "❌ Need 100k coins + 5 crystals");
    }

    p.coins -= 100000;
    p.mythicalCrystals -= 5;

    const guildId = "g_" + Date.now();

    guilds[guildId] = {
      name: name,
      leader: userId,
      members: [userId],

      image: "https://i.pinimg.com/736x/ba/cf/fd/bacffdb010bfded61e45378057724c71.jpg",

      vault: {
        coins: 0,
        mythicalTokens: 0
      },

      contributions: {}
    };

    bot.sendMessage(chatId, `🏰 Guild Created: ${name}`);
  });

  // =========================
  // JOIN GUILD
  // =========================
  bot.onText(/\/joinguild (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const name = match[1].toLowerCase();

    if (getUserGuild(userId)) {
      return bot.sendMessage(chatId, "❌ Already in guild");
    }

    for (let g in guilds) {
      if (guilds[g].name.toLowerCase() === name) {

        guilds[g].members.push(userId);

        return bot.sendMessage(chatId, `✅ Joined ${guilds[g].name}`);
      }
    }

    bot.sendMessage(chatId, "❌ Guild not found");
  });

  // =========================
  // MY GUILD (WITH URL + BUTTONS)
  // =========================
  bot.onText(/\/myguild/, (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guild = getUserGuild(userId);

    if (!guild) return bot.sendMessage(chatId, "❌ No guild");

    const isLeader = guild.leader === userId;

    const c = guild.contributions[userId] || {
      coins: 0,
      mythicalTokens: 0
    };

    const caption = `
🏰 *${guild.name}*

👑 Leader: ${guild.leader}
👥 Members: ${guild.members.length}
⭐ Role: ${isLeader ? "Leader" : "Member"}

💰 Vault:
- Coins: ${guild.vault.coins}
- Tokens: ${guild.vault.mythicalTokens}

📜 Your Contribution:
- Coins: ${c.coins}
- Tokens: ${c.mythicalTokens}

🌐 More Info: https://example.com/guild-system
    `;

    bot.sendPhoto(chatId, guild.image, {
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💰 Vault", callback_data: "guild_vault" },
            { text: "📜 Stats", callback_data: "guild_stats" }
          ],
          [
            { text: "🏆 Leaderboard", callback_data: "guild_lb" }
          ],
          [
            { text: "🌐 Guild Guide", url: "https://example.com/guild-guide" }
          ]
        ]
      }
    });
  });

  // =========================
  // SIMPLE GUILD INFO
  // =========================
  bot.onText(/\/guild/, (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guild = getUserGuild(userId);

    if (!guild) return bot.sendMessage(chatId, "❌ No guild");

    bot.sendMessage(chatId,
      `🏰 ${guild.name}\n👥 Members: ${guild.members.length}\n💰 Coins: ${guild.vault.coins}`
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

    const p = players[userId];
    const guild = getUserGuild(userId);

    if (!guild) return bot.sendMessage(chatId, "❌ No guild");

    if (!guild.contributions[userId]) {
      guild.contributions[userId] = { coins: 0, mythicalTokens: 0 };
    }

    if (type === "coins") {

      if (p.coins < amount) return bot.sendMessage(chatId, "❌ Not enough coins");

      p.coins -= amount;
      guild.vault.coins += amount;
      guild.contributions[userId].coins += amount;

    } else {

      if (p.mythicalCrystals < amount) return bot.sendMessage(chatId, "❌ Not enough tokens");

      p.mythicalCrystals -= amount;
      guild.vault.mythicalTokens += amount;
      guild.contributions[userId].mythicalTokens += amount;
    }

    bot.sendMessage(chatId, `💰 Deposited ${amount} ${type}`);
  });

  // =========================
  // WITHDRAW (LEADER ONLY)
  // =========================
  bot.onText(/\/withdraw (coins|tokens) (\d+) (\d+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const type = match[1];
    const amount = parseInt(match[2]);
    const target = match[3];

    const guild = getUserGuild(userId);

    if (!guild) return bot.sendMessage(chatId, "❌ No guild");
    if (guild.leader !== userId) return bot.sendMessage(chatId, "❌ Only leader");

    if (!players[target]) return bot.sendMessage(chatId, "❌ User not found");

    if (type === "coins") {

      if (guild.vault.coins < amount) return bot.sendMessage(chatId, "❌ Not enough vault");

      guild.vault.coins -= amount;
      players[target].coins += amount;

    } else {

      if (guild.vault.mythicalTokens < amount) return bot.sendMessage(chatId, "❌ Not enough vault");

      guild.vault.mythicalTokens -= amount;
      players[target].mythicalCrystals += amount;
    }

    bot.sendMessage(chatId, `👑 Sent ${amount} ${type} to user`);
  });

  // =========================
  // BUTTON HANDLER
  // =========================
  bot.on("callback_query", (query) => {

    const chatId = query.message.chat.id;
    const userId = query.from.id.toString();

    const guild = getUserGuild(userId);
    if (!guild) return;

    let text = "";

    if (query.data === "guild_vault") {
      text = `💰 Vault:\nCoins: ${guild.vault.coins}\nTokens: ${guild.vault.mythicalTokens}`;
    }

    if (query.data === "guild_stats") {
      const c = guild.contributions[userId] || { coins: 0, mythicalTokens: 0 };
      text = `📜 Your Stats:\nCoins: ${c.coins}\nTokens: ${c.mythicalTokens}`;
    }

    if (query.data === "guild_lb") {
      text = "🏆 Leaderboard coming soon...";
    }

    bot.sendMessage(chatId, text);
    bot.answerCallbackQuery(query.id);
  });

};
