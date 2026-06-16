const demonSlayerCharacters = require("./asset");
const demonSlayerMonsters = require("./demons");
const demonSlayerWeapons = require("./weapons");
const demonSlayerMythical = require("./mythical");
const demonSlayerGod = require("./godchar");


const soloCharacters = require("./solo_leveling/characters");
const soloMonsters = require("./solo_leveling/monsters");
const soloWeapons = require("./solo_leveling/weapons");
const soloMythical = require("./solo_leveling/mythical");


const UNIVERSES = {

"Demon Slayer": {

characters: demonSlayerCharacters,
monsters: demonSlayerMonsters,
weapons: demonSlayerWeapons,
mythical: demonSlayerMythical,
god: demonSlayerGod

},


"Solo Leveling": {

characters: soloCharacters,
monsters: soloMonsters,
weapons: soloWeapons,
mythical: soloMythical,
god: {}

}

};



function getUniverse(anime){

return UNIVERSES[anime] || UNIVERSES["Demon Slayer"];

}



function getCharacters(anime){

const data = getUniverse(anime).characters;

return data.characterRawArray || [];

}



function getMonsters(anime){

const data = getUniverse(anime).monsters;

return data.monsterRawArray || [];

}



function getWeapons(anime){

const data = getUniverse(anime).weapons;

return data.weaponRawArray || [];

}



function getMythical(anime){

const data = getUniverse(anime).mythical;

return data.mythicalRawArray || [];

}



module.exports = {

UNIVERSES,

getUniverse,
getCharacters,
getMonsters,
getWeapons,
getMythical

};
