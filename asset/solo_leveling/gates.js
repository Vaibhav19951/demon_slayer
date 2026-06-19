// =========================================
// ⚡ SOLO LEVELING — GATE SYSTEM
// =========================================

const GATES = {

  "E-Rank": {
    rank: "E-Rank",
    emoji: "⬜",
    color: "E",
    hp_range: [80, 150],
    atk_range: [15, 30],
    def_range: [5, 15],
    entry_cooldown: 5 * 60 * 1000,    // 5 min
    time_limit: 10 * 60 * 1000,       // 10 min (for future real-time use)
    xp_reward: [30, 60],
    gold_reward: [60, 120],
    drop_table: [
      { item: "gate_stone_e", chance: 0.6 },
      { item: "hp_small",     chance: 0.4 },
      { item: "shadow_core",  chance: 0.05 },
      { item: "rare_egg",     chance: 0.02 }
    ],
    monsters: [
      { name: "Gate Goblin",   emoji: "👺", hp: 80,  atk: 15, def: 5,  spd: 20 },
      { name: "Dungeon Rat",   emoji: "🐀", hp: 60,  atk: 20, def: 3,  spd: 35 },
      { name: "Stone Spider",  emoji: "🕷️", hp: 100, atk: 18, def: 8,  spd: 25 }
    ],
    boss: { name: "Gate Guardian",    emoji: "🛡️", hp: 400,  atk: 45,  def: 25,  spd: 30 },
    min_rank: null
  },

  "D-Rank": {
    rank: "D-Rank",
    emoji: "🟩",
    color: "D",
    entry_cooldown: 10 * 60 * 1000,
    xp_reward: [80, 140],
    gold_reward: [160, 280],
    drop_table: [
      { item: "gate_stone_d",   chance: 0.55 },
      { item: "hp_medium",      chance: 0.3 },
      { item: "essence_stone",  chance: 0.15 },
      { item: "shadow_core",    chance: 0.08 },
      { item: "rare_egg",       chance: 0.04 }
    ],
    monsters: [
      { name: "Orc Grunt",      emoji: "👹", hp: 200, atk: 45,  def: 22, spd: 20 },
      { name: "Skeleton Archer",emoji: "💀", hp: 170, atk: 55,  def: 15, spd: 35 },
      { name: "Dark Slime",     emoji: "🟤", hp: 240, atk: 35,  def: 35, spd: 12 }
    ],
    boss: { name: "D-Gate Warden",    emoji: "⚔️",  hp: 900,  atk: 80,  def: 55,  spd: 40 },
    min_rank: "D-Rank"
  },

  "C-Rank": {
    rank: "C-Rank",
    emoji: "🟦",
    color: "C",
    entry_cooldown: 15 * 60 * 1000,
    xp_reward: [180, 280],
    gold_reward: [360, 560],
    drop_table: [
      { item: "gate_stone_c",   chance: 0.5 },
      { item: "hp_large",       chance: 0.25 },
      { item: "weapon_fragment",chance: 0.12 },
      { item: "shadow_core",    chance: 0.12 },
      { item: "epic_egg",       chance: 0.03 }
    ],
    monsters: [
      { name: "Vampire Lord",   emoji: "🧛", hp: 420, atk: 110, def: 40,  spd: 60 },
      { name: "Troll Captain",  emoji: "👾", hp: 550, atk: 95,  def: 70,  spd: 22 },
      { name: "Dark Elf Mage",  emoji: "🧙", hp: 350, atk: 130, def: 25,  spd: 70 }
    ],
    boss: { name: "C-Gate Overlord",  emoji: "😈",  hp: 2500, atk: 150, def: 100, spd: 60 },
    min_rank: "C-Rank"
  },

  "B-Rank": {
    rank: "B-Rank",
    emoji: "🟨",
    color: "B",
    entry_cooldown: 20 * 60 * 1000,
    xp_reward: [350, 500],
    gold_reward: [700, 1000],
    drop_table: [
      { item: "gate_stone_b",   chance: 0.45 },
      { item: "monarch_fragment",chance: 0.06 },
      { item: "weapon_fragment",chance: 0.2 },
      { item: "shadow_core",    chance: 0.18 },
      { item: "epic_egg",       chance: 0.05 }
    ],
    monsters: [
      { name: "Shadow Demon",   emoji: "🌑", hp: 900,  atk: 180, def: 100, spd: 80 },
      { name: "Dragon Hatchling",emoji: "🐉",hp: 1100, atk: 160, def: 130, spd: 55 },
      { name: "Chaos Knight",   emoji: "🌀", hp: 1000, atk: 195, def: 110, spd: 70 }
    ],
    boss: { name: "B-Gate Overlord",  emoji: "🔱",  hp: 5000, atk: 280, def: 200, spd: 90 },
    min_rank: "B-Rank"
  },

  "A-Rank": {
    rank: "A-Rank",
    emoji: "🟧",
    color: "A",
    entry_cooldown: 30 * 60 * 1000,
    xp_reward: [700, 1000],
    gold_reward: [1400, 2000],
    drop_table: [
      { item: "gate_stone_a",   chance: 0.4 },
      { item: "monarch_fragment",chance: 0.1 },
      { item: "legendary_egg",  chance: 0.04 },
      { item: "shadow_core",    chance: 0.25 },
      { item: "dragon_core",    chance: 0.08 }
    ],
    monsters: [
      { name: "Arch Demon Lord",emoji: "👿", hp: 2200, atk: 360, def: 200, spd: 100 },
      { name: "Ancient Golem",  emoji: "🗿", hp: 3000, atk: 290, def: 280, spd: 35 },
      { name: "Void Wraith",    emoji: "👻", hp: 1900, atk: 400, def: 160, spd: 130 }
    ],
    boss: { name: "A-Gate Overlord",  emoji: "💀",  hp: 10000, atk: 450, def: 320, spd: 120 },
    min_rank: "A-Rank"
  },

  "S-Rank": {
    rank: "S-Rank",
    emoji: "🟥",
    color: "S",
    entry_cooldown: 60 * 60 * 1000,
    xp_reward: [2000, 3000],
    gold_reward: [4000, 6000],
    drop_table: [
      { item: "gate_stone_s",   chance: 0.35 },
      { item: "monarch_fragment",chance: 0.18 },
      { item: "mythical_egg",   chance: 0.02 },
      { item: "shadow_core",    chance: 0.35 },
      { item: "antares_core",   chance: 0.03 }
    ],
    monsters: [
      { name: "Monarch General",emoji: "⚜️", hp: 6000, atk: 600, def: 420, spd: 160 },
      { name: "Void Dragon",    emoji: "🔥", hp: 8000, atk: 560, def: 500, spd: 130 },
      { name: "Shadow Monarch Soldier",emoji:"🌑",hp:7000,atk:650,def:440,spd:170}
    ],
    boss: { name: "S-Gate Monarch",   emoji: "👑",  hp: 25000, atk: 800, def: 600, spd: 200 },
    min_rank: "S-Rank"
  }

};

// Rank order for min_rank check
const RANK_ORDER = ["E-Rank","D-Rank","C-Rank","B-Rank","A-Rank","S-Rank","National Level","Shadow Monarch"];

const canEnterGate = (playerRank, gateRank) => {
  if (!GATES[gateRank]?.min_rank) return true;
  return RANK_ORDER.indexOf(playerRank) >= RANK_ORDER.indexOf(GATES[gateRank].min_rank);
};

const getAvailableGates = (playerRank) => {
  return Object.values(GATES).filter(g => canEnterGate(playerRank, g.rank));
};

module.exports = { GATES, RANK_ORDER, canEnterGate, getAvailableGates };
