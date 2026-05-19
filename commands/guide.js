module.exports = (bot) => {

  // =========================
  // GUIDE MENU
  // =========================
  bot.onText(/\/guide/, (msg) => {

    const chatId = msg.chat.id;

    bot.sendMessage(chatId,
      `📘 *GAME GUIDE MENU*

Choose option below 👇`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🏰 Guild Guide", callback_data: "g_guild" },
              { text: "💰 Economy Guide", callback_data: "g_econ" }
            ],
            [
              { text: "🏆 Leaderboard Guide", callback_data: "g_lb" }
            ],
            [
              { text: "🌐 Full Docs", url: "https://i.pinimg.com/1200x/84/cd/f4/84cdf4c009b58718595e9e0998def838.jpg" }
            ]
          ]
        }
      }
    );
  });

  // =========================
  // BUTTON HANDLER
  // =========================
  bot.on("callback_query", (q) => {

    const chatId = q.message.chat.id;
    const data = q.data;

    let text = "";

    if (data === "g_guild") {
      text = `
🏰 GUILD GUIDE

/createguild <name>  
/joinguild <name>  
/myguild  
/guildlb  

💡 Cost: 100k coins + 5 crystals
      `;
    }

    if (data === "g_econ") {
      text = `
💰 ECONOMY GUIDE

/balance  
/daily  
/work  
/deposit coins 100  
      `;
    }

    if (data === "g_lb") {
      text = `
🏆 LEADERBOARD GUIDE

/guildlb → guild ranking  
Soon: player ranking system 🔥
      `;
    }

    bot.sendMessage(chatId, text);
    bot.answerCallbackQuery(q.id);
  });

};
