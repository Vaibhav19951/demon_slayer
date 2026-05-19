bot.onText(/\/guildlb/, (msg) => {

  const chatId = msg.chat.id;

  let list = [];

  for (let g in guilds) {

    const guild = guilds[g];
    if (!guild) continue;

    const coins = guild.vault?.coins || 0;
    const tokens = guild.vault?.mythicalTokens || 0;

    const score = coins + (tokens * 10);

    list.push({
      name: guild.name,
      members: guild.members.length,
      score: score
    });
  }

  list.sort((a, b) => b.score - a.score);

  let text = `
🏆 *GUILD LEADERBOARD*

📘 HOW TO JOIN GUILD:
/joinguild <guild name>

🏰 HOW TO CREATE GUILD:
/createguild <name>

📜 MY GUILD:
/myguild

💰 DEPOSIT:
/deposit coins 100
/deposit tokens 5

━━━━━━━━━━━━━━
TOP GUILDS 👇
  `;

  if (list.length === 0) {
    return bot.sendMessage(chatId, "❌ No guilds yet");
  }

  list.slice(0, 10).forEach((g, i) => {
    text += `\n${i + 1}. ${g.name}
👥 Members: ${g.members}
💰 Score: ${g.score}\n`;
  });

  bot.sendMessage(chatId, text, {
    parse_mode: "Markdown"
  });
});
