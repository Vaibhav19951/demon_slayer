const players = require("../data/players");

const {
  characters,
  START_IMG,
  HARU_IMG,
  SORA_IMG
} = require("../assets/assets");

module.exports = (bot) => {

  // =========================
  // START COMMAND
  // =========================
  bot.onText(/\/start/, async (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // CREATE PLAYER DATA
    if (!players[userId]) {
      players[userId] = {
        id: userId,
        coins: 1000,
        gems: 0,
        mythicalCrystals: 5,
        inventory: [],
        selectedCharacter: null
      };
    }

    // ALREADY STARTED
    if (players[userId].selectedCharacter) {

      const charData = characters.find(
        c => c.id === players[userId].selectedCharacter
      );

      return bot.sendMessage(
        chatId,
        `
⚠️ You Already Started Your Journey!

👤 Current Character:
${charData.name}

🎯 Use /hunt To Begin Hunting Demons
`
      );
    }

    // START MESSAGE
    await bot.sendPhoto(chatId, START_IMG, {
      caption: `
⚔️ WELCOME TO DEMON SLAYER BOT ⚔️

Are You Ready To Begin Your Journey
As A Demon Slayer?
`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Yes",
              callback_data: "begin_journey"
            }
          ]
        ]
      }
    });

  });

  // =========================
  // CALLBACKS
  // =========================
  bot.on("callback_query", async (query) => {

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const userId = query.from.id.toString();
    const data = query.data;

    // CREATE PLAYER
    if (!players[userId]) {
      players[userId] = {
        id: userId,
        coins: 1000,
        gems: 0,
        mythicalCrystals: 5,
        inventory: [],
        selectedCharacter: null
      };
    }

    // =========================
    // BEGIN JOURNEY
    // =========================
    if (data === "begin_journey") {

      return bot.editMessageCaption(
        `
⚔️ SELECT YOUR CHARACTER ⚔️

Choose Your Beginning 👇
`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🗡️ Haru",
                  callback_data: "select_haru"
                }
              ],
              [
                {
                  text: "🌙 Sora",
                  callback_data: "select_sora"
                }
              ]
            ]
          }
        }
      );
    }

    // =========================
    // HARU PREVIEW
    // =========================
    if (data === "select_haru") {

      const char = characters.find(c => c.id === "haru");

      return bot.sendPhoto(chatId, HARU_IMG, {
        caption: `
🗡️ ${char.name}

📜 ${char.description}

❤️ HP: ${char.hp}
⚔️ Attack: ${char.attack}
🛡️ Defense: ${char.defense}
⚡ Speed: ${char.speed}

🎖️ Rank: ${char.rank}
✨ Rarity: ${char.rarity}
`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Yes",
                callback_data: "confirm_haru"
              }
            ],
            [
              {
                text: "⬅️ Back",
                callback_data: "back_character_select"
              }
            ]
          ]
        }
      });
    }

    // =========================
    // SORA PREVIEW
    // =========================
    if (data === "select_sora") {

      const char = characters.find(c => c.id === "sora");

      return bot.sendPhoto(chatId, SORA_IMG, {
        caption: `
🌙 ${char.name}

📜 ${char.description}

❤️ HP: ${char.hp}
⚔️ Attack: ${char.attack}
🛡️ Defense: ${char.defense}
⚡ Speed: ${char.speed}

🎖️ Rank: ${char.rank}
✨ Rarity: ${char.rarity}
`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Yes",
                callback_data: "confirm_sora"
              }
            ],
            [
              {
                text: "⬅️ Back",
                callback_data: "back_character_select"
              }
            ]
          ]
        }
      });
    }

    // =========================
    // BACK TO CHARACTER SELECT
    // =========================
    if (data === "back_character_select") {

      return bot.sendMessage(
        chatId,
        `
⚔️ SELECT YOUR CHARACTER ⚔️

Choose Your Beginning 👇
`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🗡️ Haru",
                  callback_data: "select_haru"
                }
              ],
              [
                {
                  text: "🌙 Sora",
                  callback_data: "select_sora"
                }
              ]
            ]
          }
        }
      );
    }

    // =========================
    // CONFIRM HARU
    // =========================
    if (data === "confirm_haru") {

      const char = characters.find(c => c.id === "haru");

      players[userId].selectedCharacter = "haru";

      players[userId].inventory.push({
        id: char.id,
        name: char.name,
        rarity: char.rarity
      });

      await bot.sendPhoto(chatId, HARU_IMG, {
        caption: `
🔥 JOURNEY BEGINS 🔥

🗡️ You Chose ${char.name}

✅ Character Added To Inventory

🎯 New Commands Unlocked:
/hunt
/profile
/inventory
`
      });

      return bot.answerCallbackQuery(query.id);
    }

    // =========================
    // CONFIRM SORA
    // =========================
    if (data === "confirm_sora") {

      const char = characters.find(c => c.id === "sora");

      players[userId].selectedCharacter = "sora";

      players[userId].inventory.push({
        id: char.id,
        name: char.name,
        rarity: char.rarity
      });

      await bot.sendPhoto(chatId, SORA_IMG, {
        caption: `
🌙 JOURNEY BEGINS 🌙

🗡️ You Chose ${char.name}

✅ Character Added To Inventory

🎯 New Commands Unlocked:
/hunt
/profile
/inventory
`
      });

      return bot.answerCallbackQuery(query.id);
    }

  });

};
