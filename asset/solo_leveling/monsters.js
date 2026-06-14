const monsterArray = [

{
id:"wild_wolf",
name:"Wild Wolf",
anime:"Solo Leveling",
description:"A basic wild beast.",
abilities:["Bite"],
rank:"D-Rank Monster",
hp:100, atk:20, defense:10, speed:25,
rarity:"N",
image:"URL",
level:1,xpReward:[10,25], goldReward:[30,60]
},

{
id:"forest_boar",
name:"Forest Boar",
anime:"Solo Leveling",
description:"Angry forest animal with strong charge.",
abilities:["Charge"],
rank:"D-Rank Monster",
hp:130, atk:25, defense:20, speed:15,
rarity:"N",
image:"URL",
level:1,xpReward:[15,30], goldReward:[40,80]
},

{
id:"giant_rat",
name:"Giant Rat",
anime:"Solo Leveling",
description:"Fast sewer monster.",
abilities:["Infect Bite"],
rank:"D-Rank Monster",
hp:90, atk:18, defense:8, speed:35,
rarity:"N",
image:"URL",
level:1,xpReward:[10,20], goldReward:[20,50]
},

{
id:"cave_spider",
name:"Cave Spider",
anime:"Solo Leveling",
description:"Poisonous cave creature.",
abilities:["Poison Bite","Web"],
rank:"C-Rank Monster",
hp:160, atk:35, defense:25, speed:40,
rarity:"R",
image:"URL",
level:1,xpReward:[40,70], goldReward:[80,150]
},

{
id:"wild_bear",
name:"Wild Bear",
anime:"Solo Leveling",
description:"Heavy forest predator.",
abilities:["Claw Strike","Roar"],
rank:"C-Rank Monster",
hp:220, atk:45, defense:40, speed:20,
rarity:"R",
image:"URL",
level:1,xpReward:[50,90], goldReward:[120,200]
},

{
id:"venom_serpent",
name:"Venom Serpent",
anime:"Solo Leveling",
description:"Fast poison snake monster.",
abilities:["Venom Bite"],
rank:"C-Rank Monster",
hp:180, atk:40, defense:20, speed:60,
rarity:"R",
image:"URL",
level:1,xpReward:[45,80], goldReward:[100,180]
},

{
id:"armored_troll",
name:"Armored Troll",
anime:"Solo Leveling",
description:"Strong defensive monster.",
abilities:["Hammer Smash","Defense Up"],
rank:"B-Rank Monster",
hp:350, atk:70, defense:90, speed:20,
rarity:"SR",
image:"URL",
level:1,xpReward:[100,160], goldReward:[250,400]
},

{
id:"shadow_panther",
name:"Shadow Panther",
anime:"Solo Leveling",
description:"Fast and deadly predator.",
abilities:["Shadow Dash","Claw Combo"],
rank:"B-Rank Monster",
hp:300, atk:80, defense:60, speed:90,
rarity:"SR",
image:"URL",
level:1,xpReward:[120,180], goldReward:[300,500]
},

{
id:"fire_lizard",
name:"Fire Lizard",
anime:"Solo Leveling",
description:"Fire breathing beast.",
abilities:["Flame Breath","Tail Strike"],
rank:"B-Rank Monster",
hp:320, atk:85, defense:70, speed:50,
rarity:"SR",
image:"URL",
level:1,xpReward:[130,190], goldReward:[320,550]
},

{
id:"ancient_golem",
name:"Ancient Golem",
anime:"Solo Leveling",
description:"Massive stone monster.",
abilities:["Rock Smash","Earth Shield"],
rank:"A-Rank Monster",
hp:500, atk:110, defense:130, speed:25,
rarity:"SSR",
image:"URL",
level:1,xpReward:[200,300], goldReward:[500,800]
},

{
id:"storm_beast",
name:"Storm Beast",
anime:"Solo Leveling",
description:"Electric speed monster.",
abilities:["Lightning Dash","Shock Claw"],
rank:"A-Rank Monster",
hp:450, atk:120, defense:90, speed:110,
rarity:"SSR",
image:"URL",
level:1,xpReward:[220,320], goldReward:[550,900]
},

{
id:"frost_tiger",
name:"Frost Tiger",
anime:"Solo Leveling",
description:"Ice-powered predator.",
abilities:["Ice Bite","Freeze Aura"],
rank:"A-Rank Monster",
hp:480, atk:115, defense:100, speed:95,
rarity:"SSR",
image:"URL",
level:1,xpReward:[230,350], goldReward:[600,1000]
}

];

const monsters = {};

monsterArray.forEach(m=>{
monsters[m.id] = m;
});

module.exports = {
monsters,
monsterRawArray: monsterArray
};
