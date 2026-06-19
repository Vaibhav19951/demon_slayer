// =========================================
// 🏰 100-FLOOR DUNGEON CONFIG
// =========================================

const FLOOR_CONFIG = [
  { range: [1,  10],  rank: "E-Rank", file: "e_rank", diffMult: 1.0,  minM: 1, maxM: 2 },
  { range: [11, 20],  rank: "E-Rank", file: "e_rank", diffMult: 1.4,  minM: 1, maxM: 3 },
  { range: [21, 35],  rank: "D-Rank", file: "d_rank", diffMult: 1.8,  minM: 2, maxM: 3 },
  { range: [36, 50],  rank: "C-Rank", file: "c_rank", diffMult: 2.5,  minM: 2, maxM: 4 },
  { range: [51, 65],  rank: "B-Rank", file: "b_rank", diffMult: 3.5,  minM: 2, maxM: 4 },
  { range: [66, 80],  rank: "A-Rank", file: "a_rank", diffMult: 5.0,  minM: 3, maxM: 5 },
  { range: [81, 99],  rank: "S-Rank", file: "s_rank", diffMult: 7.0,  minM: 3, maxM: 5 },
  { range: [100, 100],rank: "Monarch",file: "monarchs",diffMult: 10.0, minM: 1, maxM: 1 }
];

// Boss floors
const BOSS_FLOORS = [10, 25, 50, 75, 100];

// Checkpoint floors — death sends you back to last checkpoint
const CHECKPOINTS = [1, 10, 25, 50, 75];

// =========================================
// HELPERS
// =========================================

const getFloorConfig = (floor) => {
  return FLOOR_CONFIG.find(c => floor >= c.range[0] && floor <= c.range[1]) || FLOOR_CONFIG[0];
};

const isBossFloor = (floor) => BOSS_FLOORS.includes(floor);

const getLastCheckpoint = (floor) => {
  return [...CHECKPOINTS].reverse().find(c => c <= floor) || 1;
};

const isCheckpoint = (floor) => CHECKPOINTS.includes(floor);

// Scale monster stats by floor difficulty
const scaleMonster = (monster, diffMult, floor) => {
  const extra = 1 + (floor * 0.02); // +2% per floor on top of tier mult
  const total = diffMult * extra;
  return {
    ...monster,
    hp:  Math.floor(monster.hp  * total),
    atk: Math.floor(monster.atk * total),
    def: Math.floor(monster.def * total),
    spd: Math.floor(monster.spd * (1 + (floor * 0.01)))
  };
};

module.exports = { FLOOR_CONFIG, BOSS_FLOORS, CHECKPOINTS, getFloorConfig, isBossFloor, getLastCheckpoint, isCheckpoint, scaleMonster };
