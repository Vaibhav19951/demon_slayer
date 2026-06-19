const monsters = [
  {
    id: "antares",
    name: "Antares — Monarch of Destruction",
    emoji: "👑",
    hp: 50000, atk: 1000, def: 700, spd: 400,
    xpReward: [20000, 20000],
    goldReward: [50000, 50000],
    dropTable: [
      { item: "shadow_monarch_fragment", chance: 1.0 },
      { item: "mythical_egg", chance: 0.3 },
      { item: "antares_core", chance: 0.5 },
      { item: "monarch_fragment", chance: 1.0 }
    ],
    abilities: ["Destruction Domain", "Meteor Strike", "Dragon Summon", "Final Judgement"],
    ariseChance: 0,
    defeatMessage: "👑 ANTARES HAS FALLEN. You are the true Shadow Monarch.",
    reward_title: "Monarch Slayer",
    image: "URL"
  }
];

module.exports = { monsters };
