const monsters = [
  {
    id: "demon_general",
    name: "Demon General",
    emoji: "😈",
    hp: 1000, atk: 180, def: 100, spd: 55,
    xpReward: [180, 260], goldReward: [360, 520],
    dropTable: [
      { item: "demon_horn", chance: 0.35 },
      { item: "monarch_fragment", chance: 0.04 },
      { item: "hp_large", chance: 0.2 },
      { item: "shadow_core", chance: 0.12 }
    ],
    image: "URL"
  },
  {
    id: "giant_spider",
    name: "Arachnid Queen",
    emoji: "🕷️",
    hp: 900, atk: 200, def: 80, spd: 70,
    xpReward: [190, 270], goldReward: [380, 540],
    dropTable: [
      { item: "spider_silk", chance: 0.38 },
      { item: "essence_stone", chance: 0.18 },
      { item: "weapon_fragment", chance: 0.1 }
    ],
    image: "URL"
  },
  {
    id: "dragon_whelp",
    name: "Dragon Whelp",
    emoji: "🐉",
    hp: 1200, atk: 160, def: 130, spd: 45,
    xpReward: [200, 280], goldReward: [400, 560],
    dropTable: [
      { item: "dragon_scale", chance: 0.3 },
      { item: "dragon_core", chance: 0.08 },
      { item: "epic_egg", chance: 0.02 }
    ],
    image: "URL"
  },
  {
    id: "shadow_knight",
    name: "Shadow Knight",
    emoji: "⚔️",
    hp: 1100, atk: 195, def: 110, spd: 60,
    xpReward: [195, 275], goldReward: [390, 550],
    dropTable: [
      { item: "shadow_core", chance: 0.2 },
      { item: "knight_armor", chance: 0.08 },
      { item: "hp_large", chance: 0.15 }
    ],
    image: "URL"
  },
  {
    id: "ice_elemental",
    name: "Ice Elemental",
    emoji: "❄️",
    hp: 850, atk: 210, def: 70, spd: 80,
    xpReward: [185, 265], goldReward: [370, 530],
    dropTable: [
      { item: "ice_crystal", chance: 0.4 },
      { item: "magic_crystal", chance: 0.15 },
      { item: "mana_potion", chance: 0.12 }
    ],
    image: "URL"
  }
];

module.exports = { monsters };
