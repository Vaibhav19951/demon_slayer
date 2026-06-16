require("dotenv").config();

const Groq = require("groq-sdk");


// =========================
// 🤖 GROQ CLIENT
// =========================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// =========================
// ⚡ JARVIS AI
// =========================

async function askJarvis(prompt, userId = null) {

  try {

    console.log("🤖 JARVIS INPUT:", prompt);


    if (!prompt) {
      return "⚠️ No input received.";
    }


    const completion = await groq.chat.completions.create({

      model: "llama-3.1-8b-instant",

      messages: [

        {
          role: "system",
          content:
`
You are Jarvis, a smart AI assistant.

You are helpful, friendly and slightly cool.

Keep replies short and natural.
`
        },

        {
          role: "user",
          content: prompt
        }

      ],

      temperature: 0.7,

      max_tokens: 250

    });


    const reply = completion
      .choices[0]
      .message
      .content;


    console.log("🤖 JARVIS REPLY:", reply);


    return reply;


  } catch(err) {


    console.log(
      "🔥 JARVIS ERROR:",
      err.message
    );


    return "⚠️ Jarvis is offline.";

  }

}


module.exports = askJarvis;
