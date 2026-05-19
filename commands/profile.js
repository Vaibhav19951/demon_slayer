const players = require("../data/players");

module.exports = (bot) => {

  bot.onText(/\/profile/, async (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const user = msg.from;

    // SAFE USER INIT
    if (!players[userId]) {
      players[userId] = {
        coins: 1000,
        gems: 0,
        mythicalCrystals: 5,
        level: 1,
        xp: 0,
        rank: "Rookie",
        character: "Not Selected"
      };
    }

    const p = players[userId];

    // =========================
    // BACKGROUND IMAGE (ANY URL)
    // =========================
    const bg =
      "https://i.pinimg.com/736x/9b/35/e8/9b35e852f18742bc03131e623615ff94.jpg"; 
      // 👆 apna anime background change kar sakta hai

    // =========================
    // TEXT OVERLAY USING CAPTION
    // =========================
    const caption = `
⚔️ DEMON SLAYER PROFILE ⚔️

👤 Name: ${user.first_name}
💰 Coins: ${p.coins}
💎 Gems: ${p.gems}
📊 Level: ${p.level}
🏆 Rank: ${p.rank}
⚔️ Character: ${p.character}

🔥 DEMON SLAYER BOT
    `;

    try {
      await bot.sendPhoto(chatId, bg, {
        caption: caption
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "Profile load nahi hua 😓");
    }

  });

};