module.exports = (bot)=>{
console.log("switch loaded");


bot.command("switch",(ctx)=>{

ctx.reply(
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



bot.on("callback_query", async (ctx)=>{


const data = ctx.callbackQuery.data;

const userId = ctx.callbackQuery.from.id;

const player = bot.getPlayerData(userId);



if(data==="world_demon"){


player.anime = "Demon Slayer";


bot.savePlayerData(userId, player);


await ctx.answerCbQuery();


ctx.replyWithPhoto(

"https://i.pinimg.com/736x/81/c7/9c/81c79cb8cfcb320fb7890403fc9bc81d.jpg",

{

caption:

"⚔️ Welcome to Demon Slayer World!\n\n✅ You have successfully arrived in Demon Slayer World."

}

);


}




if(data==="world_solo"){


player.anime = "Solo Leveling";


bot.savePlayerData(userId, player);


await ctx.answerCbQuery();


ctx.replyWithPhoto(

"https://i.pinimg.com/736x/f9/72/26/f972266437c90a1021f36b713092deb6.jpg",

{

caption:

"⚡ Welcome to Solo Leveling World!\n\n✅ You have successfully arrived in Solo Leveling World."

}

);


}



});


};
