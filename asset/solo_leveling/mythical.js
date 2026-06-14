const mythicalArray = [

{
id:"sung_jinwoo_shadow_monarch",
name:"Sung Jin-Woo (Awakened)",
anime:"Solo Leveling",
description:"A special awakened version of Jin-Woo.",
abilities:["Ruler's Authority","Shadow Extraction"],
rank:"Mythical",
hp:1000,
atk:300,
defense:200,
speed:250,
rarity:"Mythical",
image:"URL",
level:1,
xp:0,
max_xp:500
},

{
id:"cha_haein_limited",
name:"Cha Hae-In (Elite)",
anime:"Solo Leveling",
description:"A special limited hunter version.",
abilities:["Sword Mastery"],
rank:"Mythical",
hp:700,
atk:250,
defense:150,
speed:220,
rarity:"Mythical",
image:"URL",
level:1,
xp:0,
max_xp:500
},

{
id:"kamish_weapon_card",
name:"Kamish Legacy",
anime:"Solo Leveling",
description:"A legendary limited item.",
abilities:["Dragon Power"],
rank:"Mythical Item",
atk_bonus:400,
def_bonus:150,
spd_bonus:100,
rarity:"Mythical",
image:"URL",
cost:10000
}

];


const mythical = {};

mythicalArray.forEach(item=>{
mythical[item.id]=item;
});


module.exports={
mythical,
mythicalRawArray: mythicalArray
};
