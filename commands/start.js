const fs = require("fs");
const path = require("path");

const playerFile = path.join(__dirname, "../data/players.json");

// =========================
// 📦 DB HELPERSconst fs = require("fs");
const path = require("path");
const { getPlayer, savePlayer } = require("../data/players");

const playerFile = path.join(__dirname, "../data/players.json");

const getDB = () => {
  try {
    if (!fs.existsSync(playerFile)) fs.writeFileSync(playerFile, "{}", "utf8");
    return JSON.parse(fs.readFileSync(playerFile, "utf8") || "{}");
  } catch (e) { return {}; }
};
const saveDB = (data) => fs.writeFileSync(playerFile, JSON.stringify(data, null, 2));

module.exports = (bot) => {

  const GC_LINK = process.env.GC_LINK || "https://t.me/your_group";
  const GC_CHAT_ID = process.env.GC_CHAT_ID ? Number(process.env.GC_CHAT_ID) : null;

  const START_IMG = "https://i.pinimg.com/736x/e1/97/3e/e1973e8421e69bc09f731b60f5102d97.jpg";
  const TANJIRO_IMG = "https://i.pinimg.com/736x/ab/26/81/ab26817caf5dbd8bd82f698f517649b7.jpg";
  const NEZUKO_IMG = "https://i.pinimg.com/736x/6c/02/c9/6c02c93d3991470183f6c169d1adc64e.jpg";

  async function checkMembership(userId) {
    if (!GC_CHAT_ID) return true;
    try {
      const member = await bot.getChatMember(GC_CHAT_ID, userId);
      return ["member", "administrator", "creator"].includes(member.status);
    } catch (err) {
      return false;
    }
  }

  // =========================================
  // /start
  // =========================================
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // Group → redirect to DM
    if (msg.chat.type !== "private") {
      const botInfo = await bot.getMe();
      return bot.sendMessage(chatId,
        `❌ *Hey ${msg.from.first_name || "Slayer"}, start in DM!*`,
        {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: [[{ text: "🚀 Start in DM", url: `https://t.me/${botInfo.username}?start=true` }]]
          }
        }
      );
    }

    const db = getDB();

    // Already registered
    if (db[userId]?.worlds?.["Demon Slayer"]?.character || db[userId]?.character) {
      const player = getPlayer(userId);
      const world = player.anime || "Demon Slayer";
      const worldData = player.worlds[world];
      return bot.sendMessage(chatId,
        `⚔️ *Welcome back, ${msg.from.first_name}!*\n\n` +
        `🌍 *World:* \`${world}\`\n` +
        `🎴 *Character:* \`${worldData.character || "None"}\`\n` +
        `📈 *Level:* \`${worldData.level || 1}\`\n` +
        `🪙 *Coins:* \`${player.coins || 0}\`\n\n` +
        `Use /profile to view your full stats!`,
        { parse_mode: "Markdown" }
      );
    }

    const isMember = await checkMembership(userId);

    if (!isMember) {
      return bot.sendMessage(chatId,
        `⚔️ *WELCOME SLAYER*\n\nJoin our group first to begin your journey!`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "💬 Join Group", url: GC_LINK }],
              [{ text: "🟢 I Have Joined", callback_data: `start_verify:${userId}` }]
            ]
          }
        }
      );
    }

    return showCharSelect(bot, chatId, userId, START_IMG);
  });

  // =========================================
  // CALLBACKS
  // =========================================
  bot.on("callback_query", async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const callerId = query.from.id.toString();

    // JOIN VERIFY
    if (data.startsWith("start_verify:")) {
      const ownerId = data.split(":")[1];
      if (callerId !== ownerId) {
        return bot.answerCallbackQuery(query.id, { text: "Not your button!", show_alert: true });
      }
      const isMember = await checkMembership(callerId);
      if (!isMember) {
        return bot.answerCallbackQuery(query.id, { text: "❌ Please join the group first!", show_alert: true });
      }
      await bot.deleteMessage(chatId, messageId).catch(() => {});
      return showCharSelect(bot, chatId, callerId, START_IMG);
    }

    // CHARACTER SELECT
    if (data.startsWith("start_char:")) {
      const parts = data.split(":");
      const char = parts[1];
      const ownerId = parts[2];

      if (callerId !== ownerId) {
        return bot.answerCallbackQuery(query.id, { text: "Not your menu!", show_alert: true });
      }

      const db = getDB();
      if (db[callerId]?.worlds?.["Demon Slayer"]?.character || db[callerId]?.character) {
        return bot.answerCallbackQuery(query.id, { text: "Already registered!", show_alert: true });
      }

      const charName = char === "tanjiro" ? "Tanjiro" : "Nezuko";

      // Build new player with the new structure
      const { defaultPlayer } = require("../data/players");
      const newPlayer = defaultPlayer(query.from.username || "Slayer");

      // Set starting character in Demon Slayer world
      newPlayer.worlds["Demon Slayer"].character = charName;
      newPlayer.worlds["Demon Slayer"].inventory = [charName];
      newPlayer.character = charName;
      newPlayer.inventory = [charName];

      // Starting items
      newPlayer.potions.hp_small = 3;
      newPlayer.coins = 1000;
      newPlayer.crystals = 5;

      db[callerId] = newPlayer;
      saveDB(db);

      await bot.deleteMessage(chatId, messageId).catch(() => {});

      return bot.sendPhoto(chatId,
        char === "tanjiro" ? TANJIRO_IMG : NEZUKO_IMG,
        {
          caption:
            `✅ *REGISTRATION COMPLETE!*\n\n` +
            `🎴 *Character:* \`${charName}\`\n` +
            `🌍 *Starting World:* \`Demon Slayer\`\n` +
            `🪙 *Coins:* \`1,000\`\n` +
            `💎 *Crystals:* \`5\`\n` +
            `🧪 *HP Potions:* \`x3\`\n\n` +
            `⚔️ Your journey begins!\n` +
            `Use /help to see all commands.`,
          parse_mode: "Markdown"
        }
      );
    }
  });
};

const getDB = () => {
    try {
        if (!fs.existsSync(playerFile)) {
            fs.mkdirSync(path.dirname(playerFile), { recursive: true });
            fs.writeFileSync(playerFile, JSON.stringify({}), "utf8");
        }
        return JSON.parse(fs.readFileSync(playerFile, "utf8") || "{}");
    } catch (e) {
        return {};
    }
};

const saveDB = (data) => {
    fs.writeFileSync(playerFile, JSON.stringify(data, null, 2));
};

// =========================
// ⚔️ START MODULE
// =========================
module.exports = (bot) => {

    // 📢 CONFIGURATION (Yahan apne group ki sahi details daalo)
    const GC_LINK = "https://t.me/demon_slayer_bot_kun"; // <-- ❌ Apne group ka asli link dalo
    const GC_CHAT_ID = -1003763305227; // <-- ❌ Apne group ki asli numeric id dalo (-100 se shuru hoti hai)

    const START_IMG = "https://i.pinimg.com/736x/e1/97/3e/e1973e8421e69bc09f731b60f5102d97.jpg";
    const TANJIRO_IMG = "https://i.pinimg.com/736x/ab/26/81/ab26817caf5dbd8bd82f698f517649b7.jpg";
    const NEZUKO_IMG = "https://i.pinimg.com/736x/6c/02/c9/6c02c93d3991470183f6c169d1adc64e.jpg";

    // =========================
    // 🔍 CHECK MEMBERSHIP
    // =========================
    async function checkMembership(userId) {
        try {
            const member = await bot.getChatMember(GC_CHAT_ID, userId);
            return ["member", "administrator", "creator"].includes(member.status);
        } catch (err) {
            console.log("Membership check error:", err.message);
            return false;
        }
    }

    // =========================
    // 🚀 /START (HANDLES BOTH GROUP & PM)
    // =========================
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        // ✨ NEW FEATURE: Agar koi player GROUP me /start karega toh yeh message jayega
        if (msg.chat.type !== "private") {
            // Bot ka username nikalne ke liye taaki direct DM link ban sake
            const botInfo = await bot.getMe();
            const botUsername = botInfo.username;

            return bot.sendMessage(chatId, 
                `❌ *Hey ${msg.from.first_name || "Slayer"}, you cannot start your journey inside the group!* \n\n` +
                `Please click the button below to start the bot in private DM.`,
                {
                    parse_mode: "Markdown",
                    reply_to_message_id: msg.message_id, // Player ke message par reply karega
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🚀 Start in DM", url: `https://t.me/${botUsername}?start=true` }]
                        ]
                    }
                }
            );
        }

        // 🔒 PRIVATE CHAT (DM) LOGIC CONTINUES BELOW...
        let db = getDB();

        // Already registered check
        if (db[userId]?.character) {
            return bot.sendMessage(chatId, `⚠️ You already selected: ${db[userId].character}`);
        }

        const isMember = await checkMembership(userId);

        // ❌ NOT MEMBER → SHOW MAIN GROUP JOIN SCREEN
        if (!isMember) {
            return bot.sendMessage(chatId,
                `⚔️ *WELCOME SLAYER*\n\n` +
                `To begin your journey, join our official main group first.\n\n` +
                `After joining, click below to continue.`,
                {
                    parse_mode: "Markdown",
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "💬 Join Main Group", url: GC_LINK }],
                            [{ text: "🟢 I Have Joined", callback_data: `start_join_verify:${userId}` }]
                        ]
                    }
                }
            );
        }

        // ✅ MEMBER → CHARACTER SELECT
        return bot.sendPhoto(chatId, START_IMG, {
            caption: "⚔️ WELCOME TO DEMON CORPS ⚔️\nChoose your path:",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "👦 Tanjiro", callback_data: `start_char:tanjiro:${userId}` },
                        { text: "👧 Nezuko", callback_data: `start_char:nezuko:${userId}` }
                    ]
                ]
            },
            parse_mode: "Markdown"
        });
    });

    // =========================
    // 🔘 CALLBACK HANDLER
    // =========================
    bot.on("callback_query", async (query) => {
        const data = query.data;
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const callerId = query.from.id.toString();

        let db = getDB();

        // =========================
        // 🟢 JOIN VERIFY
        // =========================
        if (data.startsWith("start_join_verify:")) {
            const originalId = data.split(":")[1];

            const targetId = originalId && originalId !== "undefined" ? originalId : callerId;

            if (targetId !== callerId) {
                return bot.answerCallbackQuery(query.id, {
                    text: "This button belongs to someone else!",
                    show_alert: true
                });
            }

            const isMember = await checkMembership(callerId);

            if (!isMember) {
                return bot.answerCallbackQuery(query.id, {
                    text: "❌ Please join the main group first!",
                    show_alert: true
                });
            }

            await bot.deleteMessage(chatId, messageId).catch(() => {});

            return bot.sendPhoto(chatId, START_IMG, {
                caption: "✅ VERIFIED! Choose your path:",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "👦 Tanjiro", callback_data: `start_char:tanjiro:${callerId}` },
                            { text: "👧 Nezuko", callback_data: `start_char:nezuko:${callerId}` }
                        ]
                    ]
                }
            });
        }

        // =========================
        // ⚔️ CHARACTER SELECT
        // =========================
        if (data.startsWith("start_char:")) {
            const [, char, ownerId] = data.split(":");

            const targetOwnerId = ownerId && ownerId !== "undefined" ? ownerId : callerId;

            if (callerId !== targetOwnerId) {
                return bot.answerCallbackQuery(query.id, {
                    text: "This menu is not yours!",
                    show_alert: true
                });
            }

            if (db[callerId]?.character) {
                return bot.answerCallbackQuery(query.id, {
                    text: "Already registered!",
                    show_alert: true
                });
            }

            const name = char === "tanjiro" ? "Tanjiro" : "Nezuko";

            db[callerId] = {
                username: query.from.username || "Slayer",
                coins: 1000,
                bank: 0,
                crystals: 5,
                mythic: 0,
                level: 1,
                xp: 0,
                character: name,
                inventory: [name],
                owned_weapons: [],
                materials: {},
                guildId: null,
                lastWork: 0,
                lastTask: 0
            };

            saveDB(db);

            await bot.deleteMessage(chatId, messageId).catch(() => {});

            return bot.sendPhoto(chatId,
                char === "tanjiro" ? TANJIRO_IMG : NEZUKO_IMG,
                {
                    caption:
                        `✅ REGISTRATION COMPLETE\n\n` +
                        `Character: ${name}\nCoins: 1000\nCrystals: 5\n\n` +
                        `Use /balance to start!`
                }
            );
        }
    });
};
