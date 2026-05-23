console.log("✅ LIVE LOCAL CANVAS PROFILE SYSTEM ENGAGED");

const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const dataDir = path.join(__dirname, "../data");
const playerFile = path.join(dataDir, "players.json");
const guildFile = path.join(dataDir, "guild.json");

let players = {};
let guilds = {};

try { players = JSON.parse(fs.readFileSync(playerFile, "utf8")); } catch { players = {}; }
try { guilds = JSON.parse(fs.readFileSync(guildFile, "utf8")); } catch { guilds = {}; }

module.exports = (bot) => {
  
  const getPlayerStats = (userId) => {
    if (!players[userId]) {
      players[userId] = { coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, characters: [] };
    }
    return players[userId];
  };

  bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const username = msg.from.first_name || "Demon Slayer";
    
    const stats = getPlayerStats(userId);
    const userGuild = stats.guildId && guilds[stats.guildId] ? guilds[stats.guildId].name : "No Guild Joined";
    const totalCards = stats.characters ? stats.characters.length : 0;

    const processingMsg = await bot.sendMessage(chatId, "⚡ _Generating profile card..._");

    // Tumhara permanent background link
    const permanentBackground = "https://i.pinimg.com/736x/9b/35/e8/9b35e852f18742bc03131e623615ff94.jpg";
    let avatarUrl = "https://i.imgur.com/6vb8Hzv.png"; // Default fallback PFP

    try {
      const profilePhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });
      if (profilePhotos && profilePhotos.total_count > 0) {
        const fileId = profilePhotos.photos[0][0].file_id;
        avatarUrl = await bot.getFileLink(fileId);
      }
    } catch (err) {
      console.log("Could not load user live avatar, applying fallback.");
    }

    try {
      // Dimensions set karte hain canvas ke liye
      const canvas = createCanvas(600, 350);
      const ctx = canvas.getContext("2d");

      // Background draw karna
      const bgImg = await loadImage(permanentBackground);
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Dark glass background text ke piche readability ke liye
      ctx.fillStyle = "rgba(15, 15, 22, 0.75)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border lines
      ctx.strokeStyle = "#ff4757";
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // User PFP circular cropping
      ctx.save();
      ctx.beginPath();
      ctx.arc(110, 130, 55, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      const userPfp = await loadImage(avatarUrl);
      ctx.drawImage(userPfp, 55, 75, 110, 110);
      ctx.restore();

      // PFP Outline border ring
      ctx.beginPath();
      ctx.arc(110, 130, 55, 0, Math.PI * 2, true);
      ctx.strokeStyle = "#ff4757";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Username layout text
      ctx.fillStyle = "#ff4757";
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.fillText(username, 110, 220);

      // Status Tag badge
      ctx.fillStyle = "#ff4757";
      ctx.fillRect(45, 240, 130, 24);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px Arial";
      ctx.fillText("SLAYER CORPS", 110, 256);

      // Right Side stats box layer
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(25, 25, 35, 0.85)";
      ctx.strokeStyle = "rgba(255, 71, 87, 0.25)";
      ctx.fillRect(230, 30, 340, 290);
      ctx.strokeRect(230, 30, 340, 290);

      // Data placements inside panels
      ctx.fillStyle = "#aaa"; ctx.font = "10px Arial"; ctx.fillText("SLAYER ID", 250, 60);
      ctx.fillStyle = "#ffa502"; ctx.font = "bold 15px Arial"; ctx.fillText(userId, 250, 80);

      ctx.fillStyle = "#aaa"; ctx.font = "10px Arial"; ctx.fillText("RANK LEVEL", 250, 125);
      ctx.fillStyle = "#2ed573"; ctx.font = "bold 18px Arial"; ctx.fillText(`Lvl ${stats.level}`, 250, 145);

      ctx.fillStyle = "#aaa"; ctx.font = "10px Arial"; ctx.fillText("EXPERIENCE", 410, 125);
      ctx.fillStyle = "#1e90ff"; ctx.font = "bold 18px Arial"; ctx.fillText(`${stats.xp} XP`, 410, 145);

      ctx.fillStyle = "#aaa"; ctx.font = "10px Arial"; ctx.fillText("GUILD STATUS", 250, 195);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 15px Arial"; ctx.fillText(`🏰 ${userGuild}`, 250, 215);

      ctx.fillStyle = "#aaa"; ctx.font = "10px Arial"; ctx.fillText("COINS", 250, 260);
      ctx.fillStyle = "#eccc68"; ctx.font = "bold 16px Arial"; ctx.fillText(`💰 ${stats.coins}`, 250, 280);

      ctx.fillStyle = "#aaa"; ctx.font = "10px Arial"; ctx.fillText("TOTAL CARDS", 410, 260);
      ctx.fillStyle = "#ff6b81"; ctx.font = "bold 16px Arial"; ctx.fillText(`👑 ${totalCards}`, 410, 280);

      const finalImageBuffer = canvas.toBuffer("image/png");
      await bot.deleteMessage(chatId, processingMsg.message_id);

      await bot.sendPhoto(chatId, finalImageBuffer, {
        caption: `⚔️ *Slayer Profile generated successfully via Canvas engine.*`,
        parse_mode: "Markdown"
      });

    } catch (canvasErr) {
      console.error(canvasErr);
      await bot.deleteMessage(chatId, processingMsg.message_id);
      bot.sendMessage(chatId, "❌ Profile Card rendering generation failure.");
    }
  });
};
