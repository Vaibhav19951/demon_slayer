const { createCanvas, loadImage } = require("canvas");
const players = require("../data/players");

module.exports = (bot) => {

  bot.onText(/\/profile/, async (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const user = msg.from;

    if (!players[userId]) {
      players[userId] = {
        coins: 1000,
        gems: 0,
        mythicalCrystals: 5,
        cards: [],
        character: "Not Selected",
        level: 1,
        xp: 0,
        rank: "Rookie",
        gang: "None"
      };
    }

    const p = players[userId];

    try {

      // =========================
      // CANVAS
      // =========================
      const canvas = createCanvas(900, 500);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#0a0f1f";
      ctx.fillRect(0, 0, 900, 500);

      // Main Card
      ctx.fillStyle = "#151c2e";
      ctx.fillRect(40, 40, 820, 420);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Sans";
      ctx.fillText("⚔️ DEMON SLAYER PROFILE", 60, 90);

      // =========================
      // LEFT INFO
      // =========================
      ctx.font = "20px Sans";
      ctx.fillText(`Name: ${user.first_name}`, 60, 150);
      ctx.fillText(`User ID: ${userId}`, 60, 185);

      ctx.fillText(`Gender: Male`, 60, 220);
      ctx.fillText(`Level: ${p.level}`, 60, 255);
      ctx.fillText(`XP: ${p.xp}/100`, 60, 290);

      ctx.fillText(`Rank: ${p.rank}`, 60, 325);
      ctx.fillText(`Gang: ${p.gang}`, 60, 360);

      ctx.fillText(`Character: ${p.character}`, 60, 395);

      // =========================
      // RIGHT STATS
      // =========================
      ctx.fillText(`Coins: ${p.coins}`, 520, 200);
      ctx.fillText(`Gems: ${p.gems}`, 520, 240);
      ctx.fillText(`Crystals: ${p.mythicalCrystals}`, 520, 280);
      ctx.fillText(`Cards: ${p.cards.length}`, 520, 320);

      // =========================
      // PROFILE IMAGE
      // =========================
      const photos = await bot.getUserProfilePhotos(userId);

      if (photos.total_count > 0) {
        const fileId = photos.photos[0][0].file_id;
        const fileLink = await bot.getFileLink(fileId);

        const avatar = await loadImage(fileLink);

        ctx.save();
        ctx.beginPath();
        ctx.arc(720, 110, 70, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(avatar, 650, 40, 140, 140);
        ctx.restore();
      }

      // =========================
      // FOOTER (IMPORTANT PART)
      // =========================
      ctx.fillStyle = "#00ffcc";
      ctx.font = "bold 24px Sans";
      ctx.fillText("🔥 DEMON SLAYER BOT 🔥", 300, 460);

      ctx.fillStyle = "#aaaaaa";
      ctx.font = "16px Sans";
      ctx.fillText("Train Hard • Hunt Demons • Become Hashira", 240, 485);

      // =========================
      // SEND
      // =========================
      const buffer = canvas.toBuffer();

      await bot.sendPhoto(chatId, buffer, {
        caption: "👤 Your Slayer Profile Card"
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "Profile generate nahi hua 😓");
    }

  });

};
