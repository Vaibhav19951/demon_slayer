console.log("✅ RPG HELP CENTER FILE LOADED");

module.exports = (bot) => {

  // =========================
  // HELP COMMAND
  // =========================
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    const image = "https://i.pinimg.com/1200x/5e/3d/77/5e3d77131f4866906087659fddc0ff3c.jpg"; 

    const caption = `
📘 *RPG HELP CENTER*

⚡ Select category below 👇
    `;

    bot.sendPhoto(chatId, image, {
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🏰 Guild System", callback_data: "help_guild" },
            { text: "💰 Economy System", callback_data: "help_economy" }
          ],
          [
            { text: "👤 Profile System", callback_data: "help_profile" },
            { text: "⚔️ Battle System", callback_data: "help_battle" }
          ],
          [
            { text: "📘 Guide", callback_data: "help_guide" },
            { text: "🏆 Leaderboard", callback_data: "help_lb" }
          ],
          [
            { text: "🌐 Full Docs", url: "https://example.com/rpg-bot-docs" }
          ]
        ]
      }
    });
  });

  // =========================
  // BUTTON HANDLER
  // =========================
  bot.on("callback_query", (q) => {
    const chatId = q.message.chat.id;
    const data = q.data;

    // Safety guard: Agar data help_ se start nahi hota, toh control return kar do
    if (!data.startsWith("help_")) return;

    let text = "";

    if (data === "help_guild") {
      text = `🏰 **GUILD SYSTEM**

• \`/createguild <name>\` → Create your faction
• \`/joinguild <name>\` → Join an active guild
• \`/myguild\` → Check your guild status
• \`/guildvault <amount>\` → Deposit coins to guild vault
• \`/guildrewards\` → Check weekly glory milestones
• \`/claimguildrewards\` → Claim your unlocked milestones!
• \`/guildlb\` → Rank of top guild vaults`;
    }

    if (data === "help_economy") {
      text = `💰 **ECONOMY SYSTEM**

• \`/balance\` → Check wallet coins
• \`/daily\` → Claim free tokens/coins
• \`/work\` → Hunt for cash resources
• \`/deposit <amount>\` → Move coins to personal bank account`;
    }

    if (data === "help_profile") {
      text = `👤 **PROFILE SYSTEM**

• \`/profile\` → View stats, live XP, rank & character card
• \`/inventory\` → Inspect your collection items
• \`/char\` → Lists all available database cards
• \`/char <name/id>\` → Search characters with [⭐ Normal]/[🔥 MYTHICAL] separation
• \`/equip\` → Equip weapons & accessories`;
    }

    if (data === "help_battle") {
      text = `⚔️ **BATTLE SYSTEM**

• \`/battle\` → Spawn random rank demons & battle for Coins/XP
• \`/summon\` → Use Mythical Crystals to pull characters`;
    }

    if (data === "help_guide") {
      text = `📘 **GUIDE**

• \`/guide\` → Open full visual interactive user guide panels`;
    }

    if (data === "help_lb") {
      text = `🏆 **LEADERBOARD**

• \`/guildlb\` → Main ranking network for elite clans`;
    }

    // Safety fallback check to prevent empty message crashes
    if (text) {
      bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
    }
    
    bot.answerCallbackQuery(q.id);
  });

};
