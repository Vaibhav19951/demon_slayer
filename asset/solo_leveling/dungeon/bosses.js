const bosses = {

  10: {
    name: "Gatekeeper Cerberus",
    emoji: "🐕",
    hp: 800, atk: 60, def: 30, spd: 40,
    abilities: ["Hellfire Bite", "Triple Head Roar"],
    xpReward: 300, goldReward: 500,
    dropTable: [
      { item: "rare_egg",      chance: 0.3 },
      { item: "essence_stone", chance: 0.6 },
      { item: "hp_large",      chance: 0.8 },
      { item: "shadow_core",   chance: 0.15 }
    ],
    ariseChance: 0.10,
    shadow_name: "Cerberus",
    shadow_emoji: "🐕",
    defeatMessage: "The Cerberus collapses, its three heads falling silent...",
    image: "URL"
  },

  25: {
    name: "Ice Elf Queen",
    emoji: "🧝‍♀️",
    hp: 2000, atk: 120, def: 80, spd: 90,
    abilities: ["Blizzard", "Ice Spear", "Frost Nova"],
    xpReward: 800, goldReward: 1200,
    dropTable: [
      { item: "epic_egg",       chance: 0.2 },
      { item: "weapon_fragment",chance: 0.5 },
      { item: "ice_crystal",    chance: 0.7 },
      { item: "shadow_core",    chance: 0.2 }
    ],
    ariseChance: 0.06,
    shadow_name: "Ice Queen",
    shadow_emoji: "🧝‍♀️",
    defeatMessage: "The Ice Elf Queen shatters into a thousand crystals...",
    image: "URL"
  },

  50: {
    name: "Ant King Baran",
    emoji: "🐜",
    hp: 5000, atk: 250, def: 180, spd: 120,
    abilities: ["Earthquake", "Ant Army Summon", "Berserk Mode"],
    xpReward: 2000, goldReward: 3500,
    dropTable: [
      { item: "legendary_egg",    chance: 0.15 },
      { item: "monarch_fragment", chance: 0.10 },
      { item: "ant_king_core",    chance: 0.4 },
      { item: "shadow_core",      chance: 0.3 }
    ],
    ariseChance: 0.04,
    shadow_name: "Baran",
    shadow_emoji: "🐜",
    defeatMessage: "The Ant King falls... his colony erupts in chaos.",
    image: "URL"
  },

  75: {
    name: "Beast Monarch",
    emoji: "🦁",
    hp: 12000, atk: 450, def: 300, spd: 200,
    abilities: ["Monarch Roar", "Beast Army", "Frenzy Claw", "Ruler's Domain"],
    xpReward: 5000, goldReward: 8000,
    dropTable: [
      { item: "mythical_egg",     chance: 0.10 },
      { item: "monarch_fragment", chance: 0.25 },
      { item: "beast_core",       chance: 0.5 },
      { item: "shadow_core",      chance: 0.4 }
    ],
    ariseChance: 0.02,
    shadow_name: "Beast Monarch",
    shadow_emoji: "🦁",
    defeatMessage: "The Beast Monarch howls one final time before fading into shadow...",
    image: "URL"
  },

  100: {
    name: "Antares — Monarch of Destruction",
    emoji: "👑",
    hp: 50000, atk: 1000, def: 700, spd: 400,
    abilities: ["Destruction Domain", "Meteor Strike", "Monarch's Wrath", "Dragon Summon", "Final Judgement"],
    xpReward: 20000, goldReward: 50000,
    dropTable: [
      { item: "shadow_monarch_fragment", chance: 1.0 },
      { item: "mythical_egg",            chance: 0.3 },
      { item: "antares_core",            chance: 0.5 }
    ],
    ariseChance: 0,
    defeatMessage: "👑 ANTARES HAS FALLEN. You are the true Shadow Monarch.",
    reward_title: "Monarch Slayer",
    image: "URL"
  }

};

module.exports = { bosses };
