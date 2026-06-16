const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "players.json");

// =========================================
// DEFAULT WORLD TEMPLATES
// =========================================
const defaultDemonSlayerWorld = () => ({
  rank: "Mizunoto",
  level: 1,
  xp: 0,
  xp_needed: 100,
  character: null,
  inventory: [],
  owned_weapons: [],
  equipped_weapon: null,
  dungeon_floor: 1,
  last_checkpoint: 1,
  deaths_this_hour: 0,
  death_reset_time: 0,
  injured_until: 0
});

const defaultSoloLevelingWorld = () => ({
  rank: "E-Rank",
  level: 1,
  xp: 0,
  xp_needed: 100,
  character: null,
  inventory: [],
  owned_weapons: [],
  equipped_weapon: null,
  shadows: [],               // shadow army
  dungeon_floor: 1,
  last_checkpoint: 1,
  deaths_this_hour: 0,
  death_reset_time: 0,
  injured_until: 0,
  gate_attempts: 0,
  last_gate_time: 0
});

// =========================================
// DEFAULT NEW PLAYER TEMPLATE
// =========================================
const defaultPlayer = (username) => ({
  // ── GLOBAL (shared across all worlds) ──
  username: username || "Slayer",
  coins: 1000,
  bank: 0,
  crystals: 5,
  mythic: 0,
  mythicalCrystals: 0,
  essence: 0,
  premium: false,
  premium_until: 0,
  guildId: null,

  // Active world
  anime: "Demon Slayer",

  // ── PER-WORLD DATA ──
  worlds: {
    "Demon Slayer": defaultDemonSlayerWorld(),
    "Solo Leveling": defaultSoloLevelingWorld()
  },

  // ── GLOBAL ITEMS ──
  potions: {
    hp_small: 0,
    hp_medium: 0,
    hp_large: 0,
    mana_potion: 0,
    elixir: 0,
    shadow_potion: 0,
    speed_shard: 0
  },

  // ── PET SYSTEM ──
  pets: [],                  // array of owned pet objects
  active_pet: null,          // id of currently equipped pet
  incubator: [],             // active incubating eggs [{egg_type, started_at, slot}]

  // ── PROGRESSION ──
  titles: [],                // earned title ids
  active_title: null,
  achievements: [],          // earned achievement ids
  streak: 0,
  last_daily: 0,
  last_work: 0,
  last_hunt: 0,
  last_task: 0,

  // ── BASE / HOME ──
  base: {
    training_room: 0,        // level 0 = not built
    alchemy_lab: 0,
    forge: 0,
    pet_stable: 0,
    warehouse: 0,
    garden: 0,
    treasury: 0,
    last_collect: 0
  },

  // ── MATERIALS (global crafting) ──
  materials: {},

  // ── SOCIAL ──
  married_to: null,
  trade_lock: false,

  // ── STATS ──
  total_kills: 0,
  total_battles: 0,
  battles_won: 0,
  pvp_wins: 0,
  pvp_losses: 0,
  arena_points: 0,
  highest_dungeon_floor: 0,

  // ── LEGACY COMPAT (keep for old players) ──
  inventory: [],
  owned_weapons: [],
  equipped_weapon: null,
  character: null,
  level: 1,
  xp: 0,
  active_task: null
});

// =========================================
// MIGRATE OLD PLAYER TO NEW STRUCTURE
// =========================================
const migrate = (old, userId) => {
  // Already migrated
  if (old.worlds) return old;

  console.log(`🔄 Migrating player ${userId} to new structure...`);

  const fresh = defaultPlayer(old.username);

  // Copy global fields
  fresh.coins = old.coins || 1000;
  fresh.bank = old.bank || 0;
  fresh.crystals = old.crystals || old.mythicalCrystals || 5;
  fresh.mythic = old.mythic || old.mythicTokens || 0;
  fresh.essence = old.essence || 0;
  fresh.guildId = old.guildId || null;
  fresh.last_daily = old.last_daily || 0;
  fresh.last_work = old.lastWork || old.last_work || 0;
  fresh.materials = old.materials || {};
  fresh.active_task = old.active_task || null;

  // Move old character/inventory into Demon Slayer world
  fresh.anime = old.anime || "Demon Slayer";
  fresh.worlds["Demon Slayer"].character = old.character || null;
  fresh.worlds["Demon Slayer"].inventory = old.inventory || old.owned_characters || [];
  fresh.worlds["Demon Slayer"].owned_weapons = old.owned_weapons || [];
  fresh.worlds["Demon Slayer"].equipped_weapon = old.equipped_weapon || null;
  fresh.worlds["Demon Slayer"].level = old.level || 1;
  fresh.worlds["Demon Slayer"].xp = old.xp || old.exp || 0;

  // Keep legacy fields for backward compat
  fresh.character = fresh.worlds["Demon Slayer"].character;
  fresh.inventory = fresh.worlds["Demon Slayer"].inventory;
  fresh.level = fresh.worlds["Demon Slayer"].level;
  fresh.xp = fresh.worlds["Demon Slayer"].xp;

  return fresh;
};

// =========================================
// ENSURE ALL FIELDS EXIST (for partially migrated players)
// =========================================
const ensureFields = (player) => {
  if (!player.worlds) return migrate(player);

  // Ensure both worlds exist
  if (!player.worlds["Demon Slayer"]) player.worlds["Demon Slayer"] = defaultDemonSlayerWorld();
  if (!player.worlds["Solo Leveling"]) player.worlds["Solo Leveling"] = defaultSoloLevelingWorld();

  // Ensure global fields
  if (player.potions === undefined) player.potions = defaultPlayer().potions;
  if (player.pets === undefined) player.pets = [];
  if (player.active_pet === undefined) player.active_pet = null;
  if (player.incubator === undefined) player.incubator = [];
  if (player.titles === undefined) player.titles = [];
  if (player.active_title === undefined) player.active_title = null;
  if (player.achievements === undefined) player.achievements = [];
  if (player.streak === undefined) player.streak = 0;
  if (player.base === undefined) player.base = defaultPlayer().base;
  if (player.married_to === undefined) player.married_to = null;
  if (player.arena_points === undefined) player.arena_points = 0;
  if (player.highest_dungeon_floor === undefined) player.highest_dungeon_floor = 0;
  if (player.total_kills === undefined) player.total_kills = 0;
  if (player.battles_won === undefined) player.battles_won = 0;

  // Ensure SL world has shadows
  if (!player.worlds["Solo Leveling"].shadows) player.worlds["Solo Leveling"].shadows = [];
  if (player.worlds["Solo Leveling"].gate_attempts === undefined) player.worlds["Solo Leveling"].gate_attempts = 0;

  return player;
};

// =========================================
// READ / WRITE HELPERS
// =========================================
const readDB = () => {
  try {
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}", "utf8");
    return JSON.parse(fs.readFileSync(FILE, "utf8") || "{}");
  } catch (e) {
    console.error("❌ DB Read Error:", e.message);
    return {};
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("❌ DB Write Error:", e.message);
    return false;
  }
};

// =========================================
// PUBLIC API
// =========================================

/**
 * Get player — auto creates if new, auto migrates if old
 */
const getPlayer = (userId) => {
  const db = readDB();
  const id = userId.toString();

  if (!db[id]) {
    db[id] = defaultPlayer("Slayer");
    writeDB(db);
  } else {
    const migrated = ensureFields(db[id]);
    if (migrated !== db[id]) {
      db[id] = migrated;
      writeDB(db);
    }
  }

  return db[id];
};

/**
 * Save player
 */
const savePlayer = (userId, data) => {
  const db = readDB();
  const id = userId.toString();

  // Sync crystals alias
  if (data.crystals !== undefined) data.mythicalCrystals = data.crystals;

  // Keep legacy fields in sync with active world
  const activeWorld = data.anime || "Demon Slayer";
  if (data.worlds && data.worlds[activeWorld]) {
    data.character = data.worlds[activeWorld].character;
    data.inventory = data.worlds[activeWorld].inventory;
    data.level = data.worlds[activeWorld].level;
    data.xp = data.worlds[activeWorld].xp;
  }

  db[id] = data;
  return writeDB(db);
};

/**
 * Get current world data for a player
 */
const getWorldData = (player) => {
  const world = player.anime || "Demon Slayer";
  return player.worlds[world];
};

/**
 * Save world data back into player
 */
const setWorldData = (player, worldData) => {
  const world = player.anime || "Demon Slayer";
  player.worlds[world] = worldData;
  return player;
};

/**
 * Get all players (for leaderboards etc)
 */
const getAllPlayers = () => readDB();

module.exports = {
  getPlayer,
  savePlayer,
  getWorldData,
  setWorldData,
  getAllPlayers,
  defaultPlayer,
  defaultDemonSlayerWorld,
  defaultSoloLevelingWorld
};
