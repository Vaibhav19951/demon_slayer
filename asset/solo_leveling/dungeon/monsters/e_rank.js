const monsters = [
  {
    id: "goblin",
    name: "Goblin Scout",
    emoji: "👺",
    hp: 80, atk: 15, def: 5, spd: 20,
    xpReward: [10, 20], goldReward: [20, 40],
    dropTable: [
      { item: "goblin_ear", chance: 0.5 },
      { item: "hp_small", chance: 0.2 },
      { item: "shadow_core", chance: 0.03 }
    ],
    image: "URL"
  },
  {
    id: "wolf",
    name: "Wild Wolf",
    emoji: "🐺",
    hp: 100, atk: 20, def: 8, spd: 30,
    xpReward: [15, 25], goldReward: [30, 50],
    dropTable: [
      { item: "wolf_fang", chance: 0.45 },
      { item: "hp_small", chance: 0.15 },
      { item: "essence_stone", chance: 0.05 }
    ],
    image: "URL"
  },
  {
    id: "giant_ant",
    name: "Giant Ant",
    emoji: "🐜",
    hp: 90, atk: 18, def: 10, spd: 25,
    xpReward: [12, 22], goldReward: [25, 45],
    dropTable: [
      { item: "ant_mandible", chance: 0.4 },
      { item: "hp_small", chance: 0.1 }
    ],
    image: "URL"
  },
  {
    id: "slime",
    name: "Poison Slime",
    emoji: "🟢",
    hp: 70, atk: 12, def: 15, spd: 10,
    xpReward: [8, 18], goldReward: [15, 35],
    dropTable: [
      { item: "slime_gel", chance: 0.6 },
      { item: "antidote", chance: 0.1 }
    ],
    image: "URL"
  },
  {
    id: "bat",
    name: "Shadow Bat",
    emoji: "🦇",
    hp: 60, atk: 22, def: 3, spd: 40,
    xpReward: [10, 18], goldReward: [20, 38],
    dropTable: [
      { item: "bat_wing", chance: 0.45 },
      { item: "shadow_core", chance: 0.04 }
    ],
    image: "URL"
  }
];

module.exports = { monsters };
