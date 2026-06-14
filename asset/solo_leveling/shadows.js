const shadowArray = [

{
id:"igris",
name:"Igris",
anime:"Solo Leveling",
description:"A powerful shadow knight.",
abilities:["Sword Slash","Knight Defense"],
rank:"Elite Shadow",
hp:500, atk:100, defense:90, speed:70,
rarity:"SSR",
image:"URL",
level:1,xp:0,max_xp:100
},

{
id:"beru",
name:"Beru",
anime:"Solo Leveling",
description:"A powerful shadow ant warrior.",
abilities:["Claw Attack","Speed Rush"],
rank:"Elite Shadow",
hp:600, atk:130, defense:80, speed:120,
rarity:"SSR",
image:"URL",
level:1,xp:0,max_xp:100
},

{
id:"iron",
name:"Iron",
anime:"Solo Leveling",
description:"A defensive shadow warrior.",
abilities:["Shield Bash","Iron Defense"],
rank:"Elite Shadow",
hp:700, atk:90, defense:140, speed:40,
rarity:"SR",
image:"URL",
level:1,xp:0,max_xp:100
},

{
id:"tusk",
name:"Tusk",
anime:"Solo Leveling",
description:"A magic-based shadow warrior.",
abilities:["Magic Attack","Fire Spell"],
rank:"Elite Shadow",
hp:550, atk:120, defense:70, speed:60,
rarity:"SSR",
image:"URL",
level:1,xp:0,max_xp:100
},

{
id:"greed",
name:"Greed",
anime:"Solo Leveling",
description:"A strong shadow fighter.",
abilities:["Heavy Strike","Power Boost"],
rank:"Elite Shadow",
hp:650, atk:140, defense:100, speed:55,
rarity:"SSR",
image:"URL",
level:1,xp:0,max_xp:100
},

{
id:"tank",
name:"Tank",
anime:"Solo Leveling",
description:"A giant bear-type shadow.",
abilities:["Roar","Claw Attack"],
rank:"Elite Shadow",
hp:800, atk:120, defense:150, speed:45,
rarity:"SR",
image:"URL",
level:1,xp:0,max_xp:100
}

];

const shadows = {};

shadowArray.forEach(shadow=>{
shadows[shadow.id] = shadow;
});

module.exports = {
shadows,
shadowRawArray: shadowArray
};
