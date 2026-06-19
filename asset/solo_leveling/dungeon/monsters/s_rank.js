const monsters = [
  {
    id: "monarch_soldier",
    name: "Monarch's Soldier",
    emoji: "⚜️",
    hp: 6000, atk: 600, def: 400, spd: 150,
    xpReward: [900, 1200], goldReward: [1800, 2400],
    dropTable: [
      { item: "monarch_fragment", chance: 0.15 },
      { item: "shadow_core", chance: 0.25 },
      { item: "legendary_egg", chance: 0.02 },
      { item: "hp_large", chance: 0.3 }
    ],
    image: "URL"
  },
  {
    id: "dragon_king",
    name: "Dragon King",
    emoji: "🔥",
    hp: 8000, atk: 550, def: 500, spd: 120,
    xpReward: [950, 1250], goldReward: [1900, 2500],
    dropTable: [
      { item: "dragon_king_scale", chance: 0.12 },
      { item: "dragon_core", chance: 0.2 },
      { item: "monarch_fragment", chance: 0.12 },
      { item: "epic_egg", chance: 0.05 }
    ],
    image: "URL"
  },
  {
    id: "chaos_knight",
    name: "Chaos Knight",
    emoji: "🌀",
    hp: 7000, atk: 650, def: 420, spd: 160,
    xpReward: [1000, 1300], goldReward: [2000, 2600],
    dropTable: [
      { item: "chaos_shard", chance: 0.18 },
      { item: "shadow_core", chance: 0.22 },
      { item: "monarch_fragment", chance: 0.1 }
    ],
    image: "URL"
  },
  {
    id: "void_mage",
    name: "Void Mage",
    emoji: "🌑",
    hp: 5500, atk: 720, def: 350, spd: 180,
    xpReward: [1050, 1350], goldReward: [2100, 2700],
    dropTable: [
      { item: "void_crystal", chance: 0.15 },
      { item: "magic_crystal", chance: 0.25 },
      { item: "legendary_egg", chance: 0.02 },
      { item: "mana_potion", chance: 0.2 }
    ],
    image: "URL"
  },
  {
    id: "giant_ant_queen",
    name: "Ant Queen Evolved",
    emoji: "🐛",
    hp: 9000, atk: 580, def: 480, spd: 100,
    xpReward: [1100, 1400], goldReward: [2200, 2800],
    dropTable: [
      { item: "ant_queen_core", chance: 0.1 },
      { item: "monarch_fragment", chance: 0.14 },
      { item: "shadow_core", chance: 0.28 },
      { item: "mythical_egg", chance: 0.01 }
    ],
    image: "URL"
  }
];

module.exports = { monsters };
