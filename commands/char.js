/**
 * VELIX OS | MULTI WORLD CHARACTER REGISTRY
 * Demon Slayer + Solo Leveling Character System
 */

console.log("📇 [LOADED SUCCESS] Multi World Character Matrix Synced: char.js");


const { getUniverse } = require("../asset/registry.js");


module.exports = (bot) => {



const getPlayerCards = (userId)=>{

const player = bot.getPlayerData(userId);


const universe = getUniverse(
player?.anime || "Demon Slayer"
);



return {

normalCards: universe.characters?.characters || {},

mythicCards: universe.mythical?.mythical || {}

};


};




// ===============================
// /charlist
// ===============================


bot.onText(/\/charlist/, async(msg)=>{


const chatId = msg.chat.id;


const {normalCards,mythicCards} = getPlayerCards(msg.from.id);



const keyboard=[

[
{
text:"🟢 Normal Characters",
callback_data:"global_list_normal"
},

{
text:"👑 Mythical Characters",
callback_data:"global_list_mythic"
}

]

];



bot.sendMessage(

chatId,

`📜 VELIX OS CHARACTER DATABASE

Choose category:`,

{

reply_markup:{
inline_keyboard:keyboard
}

}

);


});




// ===============================
// /char
// ===============================


bot.onText(/^\/char$/,async(msg)=>{


const chatId = msg.chat.id;


const {normalCards,mythicCards}=getPlayerCards(msg.from.id);



const allKeys=[

...Object.keys(normalCards),

...Object.keys(mythicCards)

];



let keyboard=[];



allKeys.slice(0,20).forEach(key=>{


const card =
normalCards[key] ||
mythicCards[key];


keyboard.push([

{

text:`🎴 ${card.name}`,

callback_data:`vlist_${key}`

}

]);


});




bot.sendMessage(

chatId,

`⚔️ CHARACTER LIST

Select your character:`,

{

reply_markup:{
inline_keyboard:keyboard
}

}

);



});





// ===============================
// /char name
// ===============================


bot.onText(/^\/char (.+)/,async(msg,match)=>{


const chatId=msg.chat.id;


const input =
match[1]
.toLowerCase()
.replace(/\s+/g,"_");



const {normalCards,mythicCards}=getPlayerCards(msg.from.id);



const card =
normalCards[input] ||
mythicCards[input];



if(!card){

return bot.sendMessage(
chatId,
"❌ Character not found in your world."
);

}




const image =
card.img ||
card.image;



const text=

`🎴 ${card.name}

❤️ HP: ${card.hp}
⚔️ ATK: ${card.atk}

📝 ${card.desc || "No description"}

✨ Abilities:
${card.abilities?.join(", ") || "None"}
`;



if(image && image.startsWith("http")){


bot.sendPhoto(

chatId,

image,

{
caption:text
}

);


}else{


bot.sendMessage(chatId,text);


}



});





// ===============================
// CALLBACK
// ===============================


bot.on("callback_query",async(query)=>{


const data=query.data;



if(
!data.startsWith("vlist_") &&
!data.startsWith("global_list")
)return;



const userId=query.from.id;


const {normalCards,mythicCards}=getPlayerCards(userId);



await bot.answerCallbackQuery(query.id);




if(data==="global_list_normal"){


let msg="🟢 NORMAL CHARACTERS\n\n";


Object.values(normalCards)
.forEach((c,i)=>{

msg+=`${i+1}. ${c.name}\n`;

});


return bot.sendMessage(
query.message.chat.id,
msg
);


}




if(data==="global_list_mythic"){


let msg="👑 MYTHICAL CHARACTERS\n\n";


Object.values(mythicCards)
.forEach((c,i)=>{

msg+=`${i+1}. ${c.name}\n`;

});


return bot.sendMessage(
query.message.chat.id,
msg
);


}




if(data.startsWith("vlist_")){


const id=data.replace("vlist_","");



const card =
normalCards[id] ||
mythicCards[id];



if(!card)return;



const image =
card.img ||
card.image;



const text=

`🎴 ${card.name}

❤️ HP: ${card.hp}
⚔️ ATK: ${card.atk}

📝 ${card.desc || "No description"}

✨ Abilities:
${card.abilities?.join(", ") || "None"}
`;



if(image && image.startsWith("http")){


return bot.sendPhoto(

query.message.chat.id,

image,

{
caption:text
}

);


}else{


return bot.sendMessage(
query.message.chat.id,
text
);


}


}



});



};
