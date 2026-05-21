const guilds = require("../data/guild");

module.exports = (bot) => {

  // =========================
  // ADD GLORY
  // =========================
  bot.onText(/\/addglory (.+) (\d+)/, (msg, match) => {

    const chatId = msg.chat.id;

    const guildName = match[1];
    const amount = parseInt(match[2]);

    const guild = guilds[guildName];

    if (!guild) {
      return bot.sendMessage(
        chatId,
        "❌ Guild not found."
      );
    }

    guild.glory += amount;

    let rewards = "";

    // =========================
    // 2000 GLORY REWARD
    // =========================
    if (
      guild.glory >= 2000 &&
      !guild.rewardClaimed[2000]
    ) {

      guild.vault.coins += 50000;

      guild.rewardClaimed[2000] = true;

      rewards +=
`\n🎁 2000 Glory Reward
💰 +50000 Coins\n`;
    }

    // =========================
    // 4000 GLORY REWARD
    // =========================
    if (
      guild.glory >= 4000 &&
      !guild.rewardClaimed[4000]
    ) {

      guild.vault.coins += 100000;

      guild.rewardClaimed[4000] = true;

      rewards +=
`\n🎁 4000 Glory Reward
💰 +100000 Coins\n`;
    }

    // =========================
    // 6000 GLORY REWARD
    // =========================
    if (
      guild.glory >= 6000 &&
      !guild.rewardClaimed[6000]
    ) {

      guild.vault.mythicalTokens += 100;

      guild.rewardClaimed[6000] = true;

      rewards +=
`\n🎁 6000 Glory Reward
🧬 +100 Mythical Tokens\n`;
    }

    // =========================
    // 8000 GLORY REWARD
    // =========================
    if (
      guild.glory >= 8000 &&
      !guild.rewardClaimed[8000]
    ) {

      guild.guildTokens += 20;

      guild.rewardClaimed[8000] = true;

      rewards +=
`\n👑 FINAL GUILD REWARD
🏅 +20 Guild Tokens\n`;
    }

    guilds.save();

    bot.sendPhoto(
      chatId,
      "https://i1-c.pinimg.com/1200x/0f/4b/81/0f4b818b962dc5a441b21dfa99724eea.jpg",
      {
        caption:
`✨ Glory Added Successfully

🏰 Guild:
${guildName}

🏆 Total Glory:
${guild.glory}

${rewards}`,

        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🏰 View Guild",
                callback_data: "viewguild"
              }
            ]
          ]
        }
      }
    );

  });

};
