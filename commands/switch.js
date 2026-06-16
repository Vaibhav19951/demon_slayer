const { getPlayer, savePlayer } = require("../data/players");
const { getRankByLevel } = require("../asset/solo_leveling/ranks");

module.exports = (bot) => {

  // =========================================
  // /switch COMMAND
  // =========================================
  bot.onText(/\/switch/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const player = getPlayer(userId);
    const currentWorld = player.anime || "Demon Slayer";

    bot.sendMessage(chatId,
      `🌌 *WORLD SELECTOR*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 *Current World:* \`${currentWorld}\`\n\n` +
      `Choose the world you want to enter:`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: `⚔️ Demon Slayer World${currentWorld === "Demon Slayer" ? " ✅" : ""}`, callback_data: `sw_world:Demon Slayer:${userId}` }],
            [{ text: `⚡ Solo Leveling World${currentWorld === "Solo Leveling" ? " ✅" : ""}`, callback_data: `sw_world:Solo Leveling:${userId}` }]
          ]
        }
      }
    );
  });

  // =========================================
  // CALLBACK HANDLER
  // =========================================
  bot.on("callback_query", async (query) => {
    if (!query.data.startsWith("sw_world:")) return;

    const parts = query.data.split(":");
    // format: sw_world:WORLD NAME:userId
    // World name may contain space so rejoin parts[1] and parts[2] minus last
    const userId = parts[parts.length - 1];
    const newWorld = parts.slice(1, parts.length - 1).join(":");

    const clickerId = query.from.id.toString();

    // Security check
    if (clickerId !== userId) {
      return bot.answerCallbackQuery(query.id, {
        text: "❌ This is not your switch panel!",
        show_alert: true
      });
    }

    let player = getPlayer(userId);
    const currentWorld = player.anime || "Demon Slayer";

    // Already in this world
    if (currentWorld === newWorld) {
      return bot.answerCallbackQuery(query.id, {
        text: `You are already in ${newWorld}!`,
        show_alert: true
      });
    }

    // Switch world
    player.anime = newWorld;
    savePlayer(userId, player);

    await bot.answerCallbackQuery(query.id);

    // Clear buttons
    await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id
    }).catch(() => {});

    // Get new world data to show stats
    const worldData = player.worlds[newWorld];
    const rank = worldData.rank || (newWorld === "Solo Leveling" ? "E-Rank" : "Mizunoto");
    const level = worldData.level || 1;
    const character = worldData.character || "None";

    const worldImages = {
      "Demon Slayer": "https://i.pinimg.com/736x/81/c7/9c/81c79cb8cfcb320fb7890403fc9bc81d.jpg",
      "Solo Leveling": "https://i.pinimg.com/736x/f9/72/26/f972266437c90a1021f36b713092deb6.jpg"
    };

    const worldEmojis = {
      "Demon Slayer": "⚔️",
      "Solo Leveling": "⚡"
    };

    const emoji = worldEmojis[newWorld] || "🌌";

    await bot.sendPhoto(query.message.chat.id, worldImages[newWorld], {
      caption:
        `${emoji} *WORLD TRANSFER COMPLETE*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🌍 *World:* \`${newWorld}\`\n` +
        `🏅 *Rank:* \`${rank}\`\n` +
        `📈 *Level:* \`${level}\`\n` +
        `🎴 *Character:* \`${character}\`\n` +
        `🎒 *Inventory:* \`${worldData.inventory?.length || 0} cards\`\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💡 Your coins & premium carry over.\n` +
        `All progress is saved per world!`,
      parse_mode: "Markdown"
    });
  });
};
