const TelegramBot = require("node-telegram-bot-api");
const demons = require("../asset/demons");

// Save active battles
const battles = {};

module.exports = (bot) => {

  // =========================
  // ⚔️ /battle
  // =========================
  bot.onText(/\/battle/, async (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Prevent multiple battles
    if (battles[userId]) {
      return bot.sendMessage(
        chatId,
        "⚠️ You are already in a battle!"
      );
    }

    // Random demon
    const demon =
      demons[Math.floor(Math.random() * demons.length)];

    // Player Data
    battles[userId] = {
      demon,
      playerHp: 150,
      demonHp: demon.hp,
      shield: false,
    };

    // Send demon
    await bot.sendPhoto(chatId, demon.image, {
      caption: `👹 A Demon Appeared!

🏷 Name: ${demon.name}
⚡ Rank: ${demon.rank}
🔥 Type: ${demon.type}

❤️ HP: ${demon.hp}
🗡 ATK: ${demon.attack}
🛡 DEF: ${demon.defense}

What will you do?`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "⚔️ Slay", callback_data: "slay" },
            { text: "🏃 Run", callback_data: "run" }
          ]
        ]
      }
    });

  });

  // =========================
  // 🔘 BUTTONS
  // =========================
  bot.on("callback_query", async (query) => {

    const data = query.data;
    const msg = query.message;
    const chatId = msg.chat.id;
    const userId = query.from.id;

    // No battle
    if (!battles[userId]) {
      return bot.answerCallbackQuery(query.id, {
        text: "No active battle!"
      });
    }

    const battle = battles[userId];
    const demon = battle.demon;

    // =========================
    // 🏃 RUN
    // =========================
    if (data === "run") {

      delete battles[userId];

      await bot.editMessageCaption(
        `🏃 You escaped from ${demon.name}!`,
        {
          chat_id: chatId,
          message_id: msg.message_id,
        }
      );

      return bot.answerCallbackQuery(query.id);
    }

    // =========================
    // ⚔️ START FIGHT
    // =========================
    if (data === "slay") {

      await bot.editMessageCaption(
        `⚔️ Battle Started Against ${demon.name}!

❤️ Your HP: ${battle.playerHp}
👹 Demon HP: ${battle.demonHp}`,
        {
          chat_id: chatId,
          message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🗡 Attack", callback_data: "attack" },
                { text: "🛡 Shield", callback_data: "shield" }
              ],
              [
                { text: "🏃 Run", callback_data: "run" }
              ]
            ]
          }
        }
      );

      return bot.answerCallbackQuery(query.id);
    }

    // =========================
    // 🛡 SHIELD
    // =========================
    if (data === "shield") {

      battle.shield = true;

      await bot.answerCallbackQuery(query.id, {
        text: "🛡 Shield Activated!"
      });

      return;
    }

    // =========================
    // 🗡 ATTACK
    // =========================
    if (data === "attack") {

      // Player attack
      const playerDamage =
        Math.floor(Math.random() * 20) + 15;

      battle.demonHp -= playerDamage;

      let text = `🗡 You attacked ${demon.name}
💥 ${playerDamage} damage!

👹 Demon HP: ${Math.max(0, battle.demonHp)}
❤️ Your HP: ${battle.playerHp}

`;

      // Demon defeated
      if (battle.demonHp <= 0) {

        delete battles[userId];

        text += `🏆 YOU WON!

💰 +${demon.reward} Coins
✨ +${demon.exp} EXP`;

        await bot.editMessageCaption(text, {
          chat_id: chatId,
          message_id: msg.message_id,
        });

        return bot.answerCallbackQuery(query.id);
      }

      // Demon attack
      let demonDamage =
        Math.floor(Math.random() * demon.attack) + 5;

      // Shield reduce damage
      if (battle.shield) {
        demonDamage = Math.floor(demonDamage / 2);
        battle.shield = false;
        text += `🛡 Shield reduced damage!\n\n`;
      }

      battle.playerHp -= demonDamage;

      text += `👹 ${demon.name} attacked!
💥 ${demonDamage} damage!

❤️ Your HP: ${Math.max(0, battle.playerHp)}`;

      // Player defeated
      if (battle.playerHp <= 0) {

        delete battles[userId];

        text += `

☠️ You were defeated...`;

        await bot.editMessageCaption(text, {
          chat_id: chatId,
          message_id: msg.message_id,
        });

        return bot.answerCallbackQuery(query.id);
      }

      // Continue battle
      await bot.editMessageCaption(text, {
        chat_id: chatId,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🗡 Attack", callback_data: "attack" },
              { text: "🛡 Shield", callback_data: "shield" }
            ],
            [
              { text: "🏃 Run", callback_data: "run" }
            ]
          ]
        }
      });

      return bot.answerCallbackQuery(query.id);
    }

  });

};
