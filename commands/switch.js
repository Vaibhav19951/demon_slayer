module.exports = (bot) => {


// SWITCH COMMAND

bot.onText(/\/switch/, async (msg) => {

const chatId = msg.chat.id;

bot.sendMessage(
chatId,
"🌌 Choose your world to enter:",
{
reply_markup:{
inline_keyboard:[

[
{
text:"⚔️ Demon Slayer World",
callback_data:"world_demon"
}
],

[
{
text:"⚡ Solo Leveling World",
callback_data:"world_solo"
}
]

]
}
}
);

});




// BUTTON HANDLER

bot.on("callback_query", async (query)=>{


const data = query.data;

const userId = query.from.id;


if(data === "world_demon"){


let player = bot.getPlayerData(userId);


player.anime = "Demon Slayer";


bot.savePlayerData(userId, player);



await bot.answerCallbackQuery(query.id);



bot.sendPhoto(
userId,

"https://i.pinimg.com/736x/81/c7/9c/81c79cb8cfcb320fb7890403fc9bc81d.jpg",

{
caption:
"⚔️ Welcome to Demon Slayer World!\n\n✅ You have successfully arrived in Demon Slayer World."
}

);


}




if(data === "world_solo"){


let player = bot.getPlayerData(userId);


player.anime = "Solo Leveling";


bot.savePlayerData(userId, player);



await bot.answerCallbackQuery(query.id);



bot.sendPhoto(
userId,

"https://i.pinimg.com/736x/f9/72/26/f972266437c90a1021f36b713092deb6.jpg",

{
caption:
"⚡ Welcome to Solo Leveling World!\n\n✅ You have successfully arrived in Solo Leveling World."
}

);


}


});


};
