const express = require("express");
const { createCanvas, loadImage } = require("canvas");

const app = express();

app.get("/profile", async (req, res) => {

  const name = req.query.name || "Player";
  const coins = req.query.coins || 0;
  const level = req.query.level || 1;
  const rank = req.query.rank || "Rookie";

  const canvas = createCanvas(900, 500);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0b0f1a";
  ctx.fillRect(0, 0, 900, 500);

  // Card
  ctx.fillStyle = "#1a2233";
  ctx.fillRect(40, 40, 820, 420);

  // Title
  ctx.fillStyle = "#fff";
  ctx.font = "bold 40px Arial";
  ctx.fillText("⚔️ DEMON SLAYER PROFILE", 60, 100);

  // Info
  ctx.font = "25px Arial";
  ctx.fillText(`Name: ${name}`, 60, 180);
  ctx.fillText(`Coins: ${coins}`, 60, 230);
  ctx.fillText(`Level: ${level}`, 60, 280);
  ctx.fillText(`Rank: ${rank}`, 60, 330);

  // Footer
  ctx.fillStyle = "#00ffcc";
  ctx.fillText("🔥 Demon Slayer Bot 🔥", 250, 450);

  res.setHeader("Content-Type", "image/png");
  res.send(canvas.toBuffer("image/png"));
});

app.listen(3000, () => {
  console.log("🚀 Custom Image API Running on port 3000");
});
