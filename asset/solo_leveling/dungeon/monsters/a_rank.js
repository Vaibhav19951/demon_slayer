const monsters = [
  {
    id: "ancient_dragon",
    name: "Ancient Dragon",
    emoji: "🐲",
    hp: 2500, atk: 320, def: 220, spd: 80,
    xpReward: [400, 560], goldReward: [800, 1120],
    dropTable: [
      { item: "dragon_core", chance: 0.2 },
      { item: "dragon_scale", chance: 0.3 },
      { item: "monarch_fragment", chance: 0.06 },
      { item: "epic_egg", chance: 0.04 }
    ],
    image: "URL"
  },
  {
    id: "arch_demon",
    name: "Arch Demon",
    emoji: "👿",
    hp: 2200, atk: 360, def: 190, spd: 95,
    xpReward: [420, 580], goldReward: [840, 1160],
    dropTable: [
      { item: "demon_soul", chance: 0.25 },
      { item: "shadow_core", chance: 0.18 },
      { item: "hp_large", chance: 0.2 },
      { item: "monarch_fragment", chance: 0.05 }
    ],
    image: "URL"
  },
  {
    id: "titan_golem",
    name: "Titan Golem",
    emoji: "🗽",
    hp: 3500, atk: 280, def: 300, spd: 30,
    xpReward: [450, 610], goldReward: [900, 1220],
    dropTable: [
      { item: "titan_core", chance: 0.18 },
      { item: "golem_core", chance: 0.3 },
      { item: "weapon_fragment", chance: 0.15 }
    ],
    image: "URL"
  },
  {
    id: "phantom_assassin",
    name: "Phantom Assassin",
    emoji: "🥷",
    hp: 1800, atk: 400, def: 150, spd: 130,
    xpReward: [430, 590], goldReward: [860, 1180],
    dropTable: [
      { item: "phantom_blade", chance: 0.12 },
      { item: "shadow_core", chance: 0.2 },
      { item: "rare_egg", chance: 0.05 }
    ],
    image: "URL"
  },
  {
    id: "sea_serpent",
    name: "Abyssal Serpent",
    emoji: "🐉",
    hp: 2800, atk: 310, def: 210, spd: 75,
    xpReward: [440, 600], goldReward: [880, 1200],
    dropTable: [
      { item: "serpent_scale", chance: 0.28 },
      { item: "essence_stone", chance: 0.2 },
      { item: "epic_egg", chance: 0.03 }
    ],
    image: "URL"
  }
];

module.exports = { monsters };
