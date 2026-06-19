const monsters = [
  {
    id: "troll",
    name: "Cave Troll",
    emoji: "👾",
    hp: 500, atk: 90, def: 50, spd: 22,
    xpReward: [80, 120], goldReward: [160, 240],
    dropTable: [
      { item: "troll_hide", chance: 0.4 },
      { item: "hp_medium", chance: 0.2 },
      { item: "weapon_fragment", chance: 0.1 },
      { item: "shadow_core", chance: 0.07 }
    ],
    image: "URL"
  },
  {
    id: "basilisk",
    name: "Stone Basilisk",
    emoji: "🐍",
    hp: 450, atk: 100, def: 45, spd: 35,
    xpReward: [85, 125], goldReward: [170, 250],
    dropTable: [
      { item: "basilisk_scale", chance: 0.38 },
      { item: "essence_stone", chance: 0.15 },
      { item: "hp_medium", chance: 0.15 }
    ],
    image: "URL"
  },
  {
    id: "vampire",
    name: "Blood Vampire",
    emoji: "🧛",
    hp: 400, atk: 115, def: 35, spd: 55,
    xpReward: [90, 130], goldReward: [180, 260],
    dropTable: [
      { item: "vampire_fang", chance: 0.35 },
      { item: "shadow_core", chance: 0.1 },
      { item: "hp_large", chance: 0.08 }
    ],
    image: "URL"
  },
  {
    id: "golem_lord",
    name: "Golem Lord",
    emoji: "🗿",
    hp: 650, atk: 80, def: 80, spd: 12,
    xpReward: [95, 135], goldReward: [190, 270],
    dropTable: [
      { item: "golem_core", chance: 0.35 },
      { item: "iron_core", chance: 0.2 },
      { item: "weapon_fragment", chance: 0.12 }
    ],
    image: "URL"
  },
  {
    id: "dark_elf",
    name: "Dark Elf Archer",
    emoji: "🧝",
    hp: 380, atk: 120, def: 30, spd: 65,
    xpReward: [88, 128], goldReward: [175, 255],
    dropTable: [
      { item: "elf_arrow", chance: 0.4 },
      { item: "magic_crystal", chance: 0.15 },
      { item: "rare_egg", chance: 0.03 }
    ],
    image: "URL"
  }
];

module.exports = { monsters };
