const characterArray = [

{
id:"sung_jinwoo",
name:"Sung Jin-Woo",
anime:"Solo Leveling",
description:"An E-Rank hunter who starts from the bottom.",
abilities:["Basic Dagger Attack","Survival Instinct"],
rank:"E-Rank Hunter",
hp:100, atk:20, defense:10, speed:15,
rarity:"R",
image:"https://i.pinimg.com/736x/cb/df/76/cbdf765a606bb5bdaa398c68d2a7c88e.jpg",
level:1,xp:0,max_xp:100
},

{
id:"yoo_jinho",
name:"Yoo Jinho",
anime:"Solo Leveling",
description:"A loyal hunter and Jin-Woo's companion.",
abilities:["Support","Defense Boost"],
rank:"E-Rank Hunter",
hp:120, atk:15, defense:25, speed:10,
rarity:"R",
image:"https://i.pinimg.com/736x/24/d1/95/24d195e5648bebb8f9cea0571e10c279.jpg",
level:1,xp:0,max_xp:100
},

{
id:"lee_joohee",
name:"Lee Joo-Hee",
anime:"Solo Leveling",
description:"A healer-type hunter.",
abilities:["Healing","Recovery"],
rank:"C-Rank Hunter",
hp:150, atk:20, defense:30, speed:25,
rarity:"R",
image:"https://i.pinimg.com/736x/8e/7a/4e/8e7a4e50b8cdc3a70a4c6a394ae819f3.jpg",
level:1,xp:0,max_xp:100
},

{
id:"song_chiyul",
name:"Song Chi-Yul",
anime:"Solo Leveling",
description:"A veteran hunter skilled with swords.",
abilities:["Sword Slash"],
rank:"C-Rank Hunter",
hp:180, atk:35, defense:35, speed:25,
rarity:"R",
image:"https://i.pinimg.com/736x/2c/e8/60/2ce860cd57442cbb5b00e72d3416a5bc.jpg",
level:1,xp:0,max_xp:100
},

{
id:"kim_sangshik",
name:"Kim Sangshik",
anime:"Solo Leveling",
description:"A normal hunter.",
abilities:["Basic Combat"],
rank:"D-Rank Hunter",
hp:130, atk:25, defense:20, speed:20,
rarity:"N",
image:"https://i.pinimg.com/736x/85/af/51/85af5157da568d9b55d59c34b311056a.jpg",
level:1,xp:0,max_xp:100
},

{
id:"park_heejin",
name:"Park Heejin",
anime:"Solo Leveling",
description:"A hunter with survival skills.",
abilities:["Quick Move"],
rank:"D-Rank Hunter",
hp:140, atk:30, defense:25, speed:35,
rarity:"N",
image:"https://i.pinimg.com/1200x/93/c5/71/93c5712c9a07273513ebb59f7e38a569.jpg",
level:1,xp:0,max_xp:100
},

{
id:"kang_taeshik",
name:"Kang Taeshik",
anime:"Solo Leveling",
description:"A skilled assassin hunter.",
abilities:["Stealth","Fast Strike"],
rank:"B-Rank Hunter",
hp:250, atk:60, defense:40, speed:70,
rarity:"SR",
image:"https://i.pinimg.com/736x/bb/a4/f3/bba4f3bbd2b3333eccd42447e6897bf6.jpg",
level:1,xp:0,max_xp:100
},

{
id:"woo_jinchul",
name:"Woo Jinchul",
anime:"Solo Leveling",
description:"A disciplined hunter association member.",
abilities:["Leadership"],
rank:"A-Rank Hunter",
hp:300, atk:70, defense:60, speed:50,
rarity:"SR",
image:"https://i.pinimg.com/1200x/7c/12/fc/7c12fcbe18cb7c7201a10c56a275820a.jpg",
level:1,xp:0,max_xp:100
},

{
id:"go_myeonghwan",
name:"Go Myeonghwan",
anime:"Solo Leveling",
description:"A dungeon hunter.",
abilities:["Power Strike"],
rank:"D-Rank Hunter",
hp:150, atk:30, defense:20, speed:20,
rarity:"N",
image:"YOUR_URL",
level:1,xp:0,max_xp:100
},

{
id:"han_songyi",
name:"Han Song-Yi",
anime:"Solo Leveling",
description:"A young hunter in training.",
abilities:["Growth"],
rank:"E-Rank Hunter",
hp:100, atk:18, defense:15, speed:20,
rarity:"N",
image:"https://i.pinimg.com/736x/8e/05/c8/8e05c87971188b8ae0d7801b15782d11.jpg",
level:1,xp:0,max_xp:100
}

];

const characters = {};

characterArray.forEach(char=>{
characters[char.id]={
name:char.name,
type:char.rank,
hp:char.hp,
atk:char.atk,
desc:char.description,
img:char.image,
rarity:char.rarity,
defense:char.defense,
speed:char.speed,
abilities:char.abilities
};
});


module.exports={
characters,
characterRawArray:characterArray
};
