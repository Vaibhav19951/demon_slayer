const weaponArray = [

{
id:"kim_sword",
name:"Basic Hunter Sword",
anime:"Solo Leveling",
description:"A normal hunter sword.",
type:"Sword",
abilities:["Slash Attack"],
rank:"D-Rank Weapon",
atk_bonus:15,
def_bonus:5,
spd_bonus:5,
rarity:"N",
image:"URL",
cost:100
},

{
id:"hunter_dagger",
name:"Hunter Dagger",
anime:"Solo Leveling",
description:"A simple hunter dagger.",
type:"Dagger",
abilities:["Quick Strike"],
rank:"D-Rank Weapon",
atk_bonus:20,
def_bonus:0,
spd_bonus:15,
rarity:"R",
image:"URL",
cost:200
},

{
id:"steel_blade",
name:"Steel Blade",
anime:"Solo Leveling",
description:"A strong steel weapon.",
type:"Sword",
abilities:["Heavy Slash"],
rank:"C-Rank Weapon",
atk_bonus:35,
def_bonus:10,
spd_bonus:5,
rarity:"R",
image:"URL",
cost:500
},

{
id:"assassin_dagger",
name:"Assassin Dagger",
anime:"Solo Leveling",
description:"A fast weapon for assassins.",
type:"Dagger",
abilities:["Fast Strike","Critical Hit"],
rank:"B-Rank Weapon",
atk_bonus:60,
def_bonus:5,
spd_bonus:30,
rarity:"SR",
image:"URL",
cost:1000
},

{
id:"knight_sword",
name:"Knight Sword",
anime:"Solo Leveling",
description:"A powerful warrior sword.",
type:"Sword",
abilities:["Power Slash"],
rank:"B-Rank Weapon",
atk_bonus:70,
def_bonus:25,
spd_bonus:5,
rarity:"SR",
image:"URL",
cost:1200
},

{
id:"magic_staff",
name:"Hunter Magic Staff",
anime:"Solo Leveling",
description:"A staff used by magic hunters.",
type:"Staff",
abilities:["Magic Boost"],
rank:"A-Rank Weapon",
atk_bonus:100,
def_bonus:20,
spd_bonus:10,
rarity:"SSR",
image:"URL",
cost:2500
},

{
id:"dragon_sword",
name:"Dragon Sword",
anime:"Solo Leveling",
description:"A legendary sword.",
type:"Sword",
abilities:["Dragon Slash","Power Burst"],
rank:"S-Rank Weapon",
atk_bonus:180,
def_bonus:60,
spd_bonus:30,
rarity:"SSR",
image:"URL",
cost:5000
},

{
id:"kamish_dagger",
name:"Kamish Dagger",
anime:"Solo Leveling",
description:"A legendary dagger forged from dragon power.",
type:"Dagger",
abilities:["Dragon Fang","Critical Strike"],
rank:"S-Rank Weapon",
atk_bonus:220,
def_bonus:30,
spd_bonus:80,
rarity:"SSR",
image:"URL",
cost:8000
}

];


const weapons = {};

weaponArray.forEach(weapon=>{
weapons[weapon.id] = weapon;
});


module.exports = {
weapons,
weaponRawArray: weaponArray
};
