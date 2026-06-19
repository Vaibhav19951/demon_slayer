const monsters = [
  {
    id: "orc_warrior",
    name: "Orc Warrior",
    emoji: "👹",
    hp: 220, atk: 45, def: 25, spd: 20,
    xpReward: [35, 55], goldReward: [70, 110],
    dropTable: [
      { item: "orc_tusk", chance: 0.45 },
      { item: "weapon_fragment", chance: 0.08 },
      { item: "hp_small", chance: 0.25 }
    ],
    image: "URL"
  },
  {
    id: "skeleton_knight",
    name: "Skeleton Knight",
    emoji: "💀",
    hp: 200, atk: 50, def: 35, spd: 18,
    xpReward: [38, 58], goldReward: [75, 115],
    dropTable: [
      { item: "bone_fragment", chance: 0.5 },
      { item: "essence_stone", chance: 0.1 },
      { item: "hp_medium", chance: 0.1 }
    ],
    image: "URL"
  },
  {
    id: "dark_mage",
    name: "Dark Mage",
    emoji: "🧙",
    hp: 160, atk: 65, def: 15, spd: 30,
    xpReward: [40, 60], goldReward: [80, 120],
    dropTable: [
      { item: "magic_crystal", chance: 0.4 },
      { item: "mana_potion", chance: 0.12 },
      { item: "shadow_core", chance: 0.06 }
    ],
    image: "URL"
  },
  {
    id: "iron_golem",
    name: "Iron Golem",
    emoji: "🤖",
    hp: 320, atk: 40, def: 55, spd: 8,
    xpReward: [45, 65], goldReward: [90, 130],
    dropTable: [
      { item: "iron_core", chance: 0.4 },
      { item: "essence_stone", chance: 0.12 },
      { item: "weapon_fragment", chance: 0.07 }
    ],
    image: "URL"
  },
  {
    id: "fire_lizard",
    name: "Fire Lizard",
    emoji: "🦎",
    hp: 240, atk: 55, def: 20, spd: 35,
    xpReward: [42, 62], goldReward: [85, 125],
    dropTable: [
      { item: "fire_scale", chance: 0.45 },
      { item: "hp_medium", chance: 0.08 },
      { item: "essence_stone", chance: 0.08 }
    ],
    image: "URL"
  }
];

module.exports = { monsters };
