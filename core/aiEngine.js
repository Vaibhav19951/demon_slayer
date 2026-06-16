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
} = require("../asset/registry");



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

    const name = item.name || "";

    return name.toLowerCase().includes(query);

  });

}



// =========================
// ⚡ JARVIS AI
// =========================

async function askJarvis(prompt,userId=null){

try{


console.log("🤖 JARVIS INPUT:", prompt);


if(!prompt)
return "⚠️ No input received.";



// 🔥 CHECK DATABASE FIRST

const asset = searchAnime(prompt);



if(asset){

console.log("🔥 ASSET FOUND:", asset.name);


return `

⚔️ ${asset.name}

🌌 Anime:
${asset.anime || "Unknown"}

⭐ Rarity:
${asset.rarity || "Unknown"}

🔥 Power:
${asset.power || "Unknown"}

⚡ Skills:
${asset.skills?.join(", ") || "Unknown"}

🖼️ Image:
${asset.image || "No Image"}

`;

}




// =========================
// 🤖 GROQ FALLBACK
// =========================


const completion = await groq.chat.completions.create({

model:"llama-3.1-8b-instant",

messages:[

{
role:"system",

content:
`
You are Jarvis, an Anime RPG AI assistant.

You know:
- Demon Slayer
- Solo Leveling

Answer about:
characters,
weapons,
monsters,
powers,
anime lore.

Keep replies short and cool.
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
