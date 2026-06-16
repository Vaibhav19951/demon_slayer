require("dotenv").config();
const Groq = require("groq-sdk");

// =========================
// 📦 ANIME ASSETS
// =========================
const animeDB = {
  demonSlayer: require("./assets/demon_slayer/registry"),
  soloLeveling: require("./assets/solo_leveling/registry")
};


// =========================
// 🤖 GROQ AI CLIENT
// =========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// =========================
// 🔎 SEARCH ASSETS
// =========================
function searchAnime(query) {

  query = query.toLowerCase();

  for (const world of Object.values(animeDB)) {

    for (const type of Object.values(world)) {

      if (!Array.isArray(type)) continue;

      const found = type.find(item =>
        item.name?.toLowerCase().includes(query)
      );

      if (found) return found;

    }

  }

  return null;
}



// =========================
// ⚡ JARVIS AI FUNCTION
// =========================
async function askJarvis(prompt, userId = null) {

  try {

    if (!prompt)
      return "⚠️ No input received.";


    // 🔥 CHECK ANIME DATABASE FIRST
    const asset = searchAnime(prompt);


    if(asset){

      return `
⚔️ ${asset.name}

🌌 Anime: ${asset.anime || "Unknown"}

🔥 Power: ${asset.power || "Unknown"}

⭐ Rarity: ${asset.rarity || "Unknown"}

⚡ Skills:
${asset.skills?.join(", ") || "Unknown"}

🖼️ Image:
${asset.image || "No image"}
`;

    }



    // 🤖 AI RESPONSE
    const completion = await groq.chat.completions.create({

      model: "llama-3.1-8b-instant",

      messages: [

        {
          role:"system",
          content:
`
You are Jarvis, an anime RPG AI assistant.

You know:
- Demon Slayer
- Solo Leveling

Answer short, cool and helpful.
Do not write huge essays.
`
        },

        {
          role:"user",
          content:prompt
        }

      ],

      temperature:0.7,
      max_tokens:250

    });


    return completion.choices[0].message.content;



  } catch(err){

    console.log("🔥 JARVIS ERROR:",err.message);

    return "⚠️ Jarvis offline.";

  }

}


module.exports = askJarvis;
