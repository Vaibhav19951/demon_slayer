require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

async function askJarvis(prompt) {

  try {

    const result = await model.generateContent(
      `You are Jarvis, a smart AI assistant inside a Demon Slayer RPG Telegram bot.
      Keep replies short, helpful, cool, and human-like.

      User: ${prompt}`
    );

    return result.response.text();

  } catch (err) {

    console.log("JARVIS ERROR:", err);

    return "⚠️ Jarvis is currently offline.";
  }
}

module.exports = askJarvis;
