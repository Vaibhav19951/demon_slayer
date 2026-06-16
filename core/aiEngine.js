require("dotenv").config();

const Groq = require("groq-sdk");


// =========================
// 📦 ANIME DATABASE
// =========================

const {
  getCharacters,
  getMonsters,
  getWeapons,
  getMythical
} = require("./assets/registry");



// =========================
// 🤖 GROQ CLIENT
// =========================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});



// =========================
// 🔎 SEARCH ANIME ASSETS
// =========================

function searchAnime(query){

  query = query.toLowerCase();


  const database = [

    ...getCharacters("Demon Slayer"),
    ...getCharacters("Solo Leveling"),

    ...getMonsters("Demon Slayer"),
    ...getMonsters("Solo Leveling"),

    ...getWeapons("Demon Slayer"),
    ...getWeapons("Solo Leveling"),

    ...getMythical("Demon Slayer"),
    ...getMythical("Solo Leveling")

  ];


  return database.find(item => {

    const name = item.name || item.id || "";

    return name.toLowerCase().includes(query);

  });

}



// =========================
// ⚡ JARVIS AI
// =========================

async function askJarvis(prompt,userId=null){


try{


if(!prompt)
return "⚠️ No input received.";



// =========================
// 🔥 CHECK OWN DATABASE FIRST
// =========================


const asset = searchAnime(prompt);



if(asset){


return `

⚔️ ${asset.name || "Unknown"}

🌌 Anime:
${asset.anime || "Anime Universe"}

⭐ Rarity:
${asset.rarity || "Unknown"}

🔥 Power:
${asset.power || "Unknown"}

⚡ Skills:
${asset.skills?.join(", ") || "Unknown"}

🖼️ Image:
${asset.image || "No Image Available"}

`;

}





// =========================
// 🤖 GROQ AI FALLBACK
// =========================


const completion = await groq.chat.completions.create({


model:"llama-3.1-8b-instant",



messages:[

{

role:"system",

content:

`
You are Jarvis, an AI assistant inside an Anime RPG Telegram bot.

You know:
- Demon Slayer
- Solo Leveling

Answer about:
characters,
weapons,
monsters,
powers,
anime lore.

Keep replies short, cool and helpful.
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



return completion
.choices[0]
.message
.content;



}

catch(err){


console.log(
"🔥 JARVIS ERROR:",
err.message
);


return "⚠️ Jarvis is offline right now.";

}



}



module.exports = askJarvis;
