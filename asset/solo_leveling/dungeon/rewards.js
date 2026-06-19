const FLOOR_REWARDS = {
  10:  { gold: 500,   xp: 200,   items: ["hp_medium"],                         title: null },
  25:  { gold: 1500,  xp: 600,   items: ["rare_egg", "essence_stone"],          title: "Dungeon Diver" },
  50:  { gold: 5000,  xp: 2000,  items: ["epic_egg", "weapon_fragment"],        title: "Gate Breaker" },
  75:  { gold: 15000, xp: 6000,  items: ["legendary_egg", "monarch_fragment"],  title: "Monarch Hunter" },
  100: { gold: 50000, xp: 20000, items: ["shadow_monarch_fragment","mythical_egg"], title: "Floor 100 Conqueror" }
};

// XP and gold per normal floor clear (scales with floor number)
const getFloorBaseReward = (floor) => ({
  xp:   Math.floor(10 + floor * 3),
  gold: Math.floor(20 + floor * 5)
});

module.exports = { FLOOR_REWARDS, getFloorBaseReward };
