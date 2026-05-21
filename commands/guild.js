console.log("✅ GUILD FILE LOADED");

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
    const guildName = match[1];

    const player = getPlayer(userId);

    if (getUserGuild(userId)) {
      return bot.sendMessage(
        chatId,
        "❌ You are already in a guild."
      );
    }

    if (
      player.coins < 100000 ||
      player.mythicalCrystals < 5
    ) {
      return bot.sendMessage(
        chatId,
        "❌ Need 100000 coins + 5 mythical tokens."
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
      }
    };

    players.save();
    guilds.save();

    bot.sendPhoto(
      chatId,
      "https://i.pinimg.com/736x/a8/ac/0a/a8ac0a06b1f0e2e716ed03b3d0811de6.jpg",
      {
        caption:
`🏰 Guild Created

🏷 Name: ${guildName}

👑 Leader:
${msg.from.first_name}

👥 Capacity:
15 Members`
      }
    );

  });

  // =========================
  // JOIN GUILD
  // =========================
  bot.onText(/\/joinguild (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const guildName = match[1];

    if (getUserGuild(userId)) {
      return bot.sendMessage(
        chatId,
        "❌ Already in a guild."
      );
    }

    const guild = guilds[guildName];

    if (!guild) {
      return bot.sendMessage(
        chatId,
        "❌ Guild not found."
      );
    }

    if (guild.members.length >= guild.maxMembers) {
      return bot.sendMessage(
        chatId,
        "❌ Guild is full."
      );
    }

    guild.members.push(userId);

    guilds.save();

    bot.sendMessage(
      chatId,
      `✅ Joined guild ${guildName}`
    );

  });

  // =========================
  // MY GUILD
  // =========================
  bot.onText(/\/myguild/, (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guild = getUserGuild(userId);

    if (!guild) {
      return bot.sendMessage(
        chatId,
        "❌ You are not in any guild."
      );
    }

    bot.sendPhoto(
      chatId,
      "https://i1-c.pinimg.com/1200x/03/2d/b8/032db8746347fbfb48e823d80777d8c4.jpg",
      {
        caption:
`🏰 *${guild.name}*

👑 Leader:
${guild.leader}

👥 Members:
${guild.members.length}/${guild.maxMembers}

🏦 Vault Coins:
${guild.vault.coins}

🧬 Vault Tokens:
${guild.vault.mythicalTokens}`,

        parse_mode: "Markdown",

        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🏆 Guild Leaderboard",
                callback_data: "guild_lb"
              }
            ]
          ]
        }
      }
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
      return bot.sendMessage(
        chatId,
        "❌ Guild not found."
      );
    }

    if (guild.leader !== userId) {
      return bot.sendMessage(
        chatId,
        "❌ Only leader can upgrade."
      );
    }

    if (guild.maxMembers >= 25) {
      return bot.sendMessage(
        chatId,
        "❌ Guild already upgraded."
      );
    }

    if (guild.vault.mythicalTokens < 150) {
      return bot.sendMessage(
        chatId,
        "❌ Need 150 guild tokens."
      );
    }

    guild.vault.mythicalTokens -= 150;

    guild.maxMembers = 25;

    guilds.save();

    bot.sendMessage(
      chatId,
      "🏰 Guild upgraded to 25 members!"
    );

  });

};
