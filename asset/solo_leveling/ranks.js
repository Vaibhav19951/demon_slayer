// =========================================
// ⚔️ DEMON SLAYER RANKS
// =========================================
const DEMON_SLAYER_RANKS = [
  { name: "Mizunoto",  level_min: 1,  level_max: 5,   xp_per_level: 100,  color: "⬜" },
  { name: "Mizunoe",   level_min: 6,  level_max: 10,  xp_per_level: 200,  color: "🟦" },
  { name: "Kanoto",    level_min: 11, level_max: 15,  xp_per_level: 350,  color: "🟩" },
  { name: "Kanoe",     level_min: 16, level_max: 20,  xp_per_level: 500,  color: "🟨" },
  { name: "Tsuchinoto",level_min: 21, level_max: 28,  xp_per_level: 700,  color: "🟧" },
  { name: "Tsuchinoe", level_min: 29, level_max: 36,  xp_per_level: 1000, color: "🟥" },
  { name: "Hinoto",    level_min: 37, level_max: 45,  xp_per_level: 1400, color: "🔴" },
  { name: "Hinoe",     level_min: 46, level_max: 55,  xp_per_level: 1800, color: "🟣" },
  { name: "Kinoto",    level_min: 56, level_max: 68,  xp_per_level: 2500, color: "🔵" },
  { name: "Kinoe",     level_min: 69, level_max: 80,  xp_per_level: 3500, color: "⚫" },
  { name: "Hashira",   level_min: 81, level_max: 100, xp_per_level: 5000, color: "🌟" }
];

// =========================================
// ⚡ SOLO LEVELING RANKS
// =========================================
const SOLO_LEVELING_RANKS = [
  { name: "E-Rank",         level_min: 1,  level_max: 10,  xp_per_level: 100,  color: "⬜" },
  { name: "D-Rank",         level_min: 11, level_max: 20,  xp_per_level: 250,  color: "🟩" },
  { name: "C-Rank",         level_min: 21, level_max: 35,  xp_per_level: 500,  color: "🟦" },
  { name: "B-Rank",         level_min: 36, level_max: 50,  xp_per_level: 900,  color: "🟨" },
  { name: "A-Rank",         level_min: 51, level_max: 70,  xp_per_level: 1500, color: "🟧" },
  { name: "S-Rank",         level_min: 71, level_max: 90,  xp_per_level: 2500, color: "🟥" },
  { name: "National Level", level_min: 91, level_max: 99,  xp_per_level: 5000, color: "🔴" },
  { name: "Shadow Monarch", level_min: 100,level_max: 100, xp_per_level: 99999,color: "👑" }
];

// =========================================
// RANK-UP EXAM BOSSES
// =========================================
const RANKUP_BOSSES = {
  "Demon Slayer": {
    "Mizunoe":    { name: "Lesser Demon",       hp: 300,  atk: 40,  def: 20, reward_coins: 500,  reward_xp: 200  },
    "Kanoto":     { name: "Blood Demon",        hp: 600,  atk: 70,  def: 40, reward_coins: 1000, reward_xp: 400  },
    "Kanoe":      { name: "Drum Demon",         hp: 1000, atk: 100, def: 60, reward_coins: 1500, reward_xp: 700  },
    "Tsuchinoto": { name: "Spider Demon",       hp: 1800, atk: 140, def: 90, reward_coins: 2500, reward_xp: 1200 },
    "Tsuchinoe":  { name: "Swamp Demon",        hp: 2800, atk: 180, def: 120,reward_coins: 4000, reward_xp: 2000 },
    "Hinoto":     { name: "Hand Demon",         hp: 4000, atk: 220, def: 150,reward_coins: 6000, reward_xp: 3000 },
    "Hinoe":      { name: "Rui (Lower Moon 5)", hp: 6000, atk: 280, def: 200,reward_coins: 9000, reward_xp: 5000 },
    "Kinoto":     { name: "Akaza (Upper Moon 3)",hp:9000, atk: 350, def: 260,reward_coins: 14000,reward_xp: 8000 },
    "Kinoe":      { name: "Doma (Upper Moon 2)", hp:14000,atk: 450, def: 350,reward_coins: 20000,reward_xp: 12000},
    "Hashira":    { name: "Muzan Kibutsuji",    hp:25000, atk: 600, def: 500,reward_coins: 50000,reward_xp: 30000}
  },
  "Solo Leveling": {
    "D-Rank":         { name: "Dungeon Goblin King",  hp: 400,  atk: 50,  def: 25, reward_coins: 600,  reward_xp: 250  },
    "C-Rank":         { name: "Iron Fang Wolf",       hp: 800,  atk: 90,  def: 50, reward_coins: 1200, reward_xp: 500  },
    "B-Rank":         { name: "Armored Troll Boss",   hp: 1500, atk: 130, def: 80, reward_coins: 2000, reward_xp: 900  },
    "A-Rank":         { name: "Ancient Stone Golem",  hp: 3000, atk: 200, def: 140,reward_coins: 4000, reward_xp: 1800 },
    "S-Rank":         { name: "Baran (Demon King)",   hp: 8000, atk: 350, def: 250,reward_coins: 10000,reward_xp: 5000 },
    "National Level": { name: "Monarchs' General",    hp: 18000,atk: 500, def: 380,reward_coins: 25000,reward_xp: 12000},
    "Shadow Monarch": { name: "Antares (Final Boss)", hp: 40000,atk: 800, def: 600,reward_coins: 99999,reward_xp: 50000}
  }
};

// =========================================
// STAT BONUSES PER LEVEL UP
// =========================================
const LEVEL_UP_BONUS = {
  hp: 10,
  atk: 5,
  def: 3,
  spd: 2
};

// =========================================
// HELPERS
// =========================================

/**
 * Get rank info for a player's level in a given world
 */
const getRankByLevel = (level, anime) => {
  const ranks = anime === "Solo Leveling" ? SOLO_LEVELING_RANKS : DEMON_SLAYER_RANKS;
  return ranks.find(r => level >= r.level_min && level <= r.level_max) || ranks[0];
};

/**
 * Get XP needed for next level
 */
const getXpNeeded = (level, anime) => {
  const rank = getRankByLevel(level, anime);
  return rank.xp_per_level * level;
};

/**
 * Check if player can rank up (is at max level for current rank)
 */
const canRankUp = (level, currentRank, anime) => {
  const rank = getRankByLevel(level, anime);
  return rank.name === currentRank && level >= rank.level_max;
};

/**
 * Get next rank name
 */
const getNextRank = (currentRank, anime) => {
  const ranks = anime === "Solo Leveling" ? SOLO_LEVELING_RANKS : DEMON_SLAYER_RANKS;
  const idx = ranks.findIndex(r => r.name === currentRank);
  return idx >= 0 && idx < ranks.length - 1 ? ranks[idx + 1] : null;
};

/**
 * Process XP gain — returns { leveled_up, new_level, new_xp, rank_changed, new_rank }
 */
const processXP = (worldData, xpGain, anime) => {
  let { level, xp } = worldData;
  xp += xpGain;

  let leveled_up = false;
  let rank_changed = false;
  const old_rank = worldData.rank;

  while (true) {
    const needed = getXpNeeded(level, anime);
    if (xp >= needed && level < 100) {
      xp -= needed;
      level++;
      leveled_up = true;

      const new_rank = getRankByLevel(level, anime);
      if (new_rank.name !== old_rank) rank_changed = true;
    } else break;
  }

  return {
    leveled_up,
    new_level: level,
    new_xp: xp,
    rank_changed,
    new_rank: getRankByLevel(level, anime).name
  };
};

/**
 * Apply death penalty — returns updated worldData
 */
const applyDeathPenalty = (worldData, type = "normal") => {
  const now = Date.now();

  // Reset death counter if hour passed
  if (now - worldData.death_reset_time > 3600000) {
    worldData.deaths_this_hour = 0;
    worldData.death_reset_time = now;
  }

  worldData.deaths_this_hour = (worldData.deaths_this_hour || 0) + 1;

  if (type === "dungeon") {
    // Go back to last checkpoint
    worldData.dungeon_floor = worldData.last_checkpoint || 1;
  }

  // 3 deaths in 1 hour = injured (50% stats for 30 min)
  if (worldData.deaths_this_hour >= 3) {
    worldData.injured_until = now + 30 * 60 * 1000;
  }

  return worldData;
};

/**
 * Check if player is injured
 */
const isInjured = (worldData) => {
  return worldData.injured_until && Date.now() < worldData.injured_until;
};

module.exports = {
  DEMON_SLAYER_RANKS,
  SOLO_LEVELING_RANKS,
  RANKUP_BOSSES,
  LEVEL_UP_BONUS,
  getRankByLevel,
  getXpNeeded,
  canRankUp,
  getNextRank,
  processXP,
  applyDeathPenalty,
  isInjured
};
