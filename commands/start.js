const { getPlayer, savePlayer, getAllPlayers, defaultPlayer } = require("../data/players");

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

    // Already registered
    const existingPlayer = getPlayer(userId);
    if (existingPlayer?.worlds?.["Demon Slayer"]?.character || existingPlayer?.character) {
      const player = existingPlayer;
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

      const existing = getPlayer(callerId);
      if (existing?.worlds?.["Demon Slayer"]?.character || existing?.character) {
        return bot.answerCallbackQuery(query.id, { text: "Already registered!", show_alert: true });
      }

      const charName = char === "tanjiro" ? "Tanjiro" : "Nezuko";

      // Build new player with the new structure
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

      savePlayer(callerId, newPlayer);

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

// =========================================
// HELPER: Show character select screen
// =========================================
function showCharSelect(bot, chatId, userId, img) {
  return bot.sendPhoto(chatId, img, {
    caption:
      `⚔️ *WELCOME TO THE DEMON CORPS*\n\n` +
      `Choose your starting character:\n\n` +
      `👦 *Tanjiro* — Balanced fighter\n` +
      `👧 *Nezuko* — Speed specialist`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[
        { text: "👦 Tanjiro", callback_data: `start_char:tanjiro:${userId}` },
        { text: "👧 Nezuko", callback_data: `start_char:nezuko:${userId}` }
      ]]
    }
  });
}
