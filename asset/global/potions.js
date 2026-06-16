// =========================================
// 🧪 GLOBAL POTIONS DATA
// All worlds use these same potions
// =========================================

const POTIONS = {

  hp_small: {
    id: "hp_small",
    name: "HP Potion (Small)",
    emoji: "🧪",
    description: "Restores 30% of your max HP.",
    heal_percent: 0.30,
    type: "heal",
    rarity: "Common",
    shop_cost: 150,
    image: "URL"
  },

  hp_medium: {
    id: "hp_medium",
    name: "HP Potion (Medium)",
    emoji: "🫙",
    description: "Restores 60% of your max HP.",
    heal_percent: 0.60,
    type: "heal",
    rarity: "Uncommon",
    shop_cost: 350,
    image: "URL"
  },

  hp_large: {
    id: "hp_large",
    name: "HP Potion (Large)",
    emoji: "💊",
    description: "Fully restores your HP.",
    heal_percent: 1.0,
    type: "heal",
    rarity: "Rare",
    shop_cost: 800,
    image: "URL"
  },

  mana_potion: {
    id: "mana_potion",
    name: "Mana Potion",
    emoji: "💙",
    description: "Resets ability cooldowns instantly.",
    type: "mana",
    rarity: "Uncommon",
    shop_cost: 400,
    image: "URL"
  },

  elixir: {
    id: "elixir",
    name: "Elixir",
    emoji: "✨",
    description: "Full HP restore + temporary ATK +20% for 1 battle.",
    heal_percent: 1.0,
    atk_boost: 0.20,
    type: "elixir",
    rarity: "Epic",
    shop_cost: 2000,
    image: "URL"
  },

  shadow_potion: {
    id: "shadow_potion",
    name: "Shadow Potion",
    emoji: "🌑",
    description: "Boosts shadow army ATK by 50% for 1 battle. (Solo Leveling only)",
    shadow_boost: 0.50,
    type: "shadow",
    rarity: "Rare",
    shop_cost: 1200,
    world_only: "Solo Leveling",
    image: "URL"
  },

  speed_shard: {
    id: "speed_shard",
    name: "Speed Shard",
    emoji: "⚡",
    description: "Skip 1 hour of incubator wait time.",
    type: "incubator",
    rarity: "Uncommon",
    shop_cost: 500,
    image: "URL"
  },

  antidote: {
    id: "antidote",
    name: "Antidote",
    emoji: "💚",
    description: "Removes the Injured status instantly.",
    type: "status",
    rarity: "Rare",
    shop_cost: 1000,
    image: "URL"
  },

  pet_food: {
    id: "pet_food",
    name: "Pet Food",
    emoji: "🍖",
    description: "Feeds your pet, restoring hunger by 50.",
    hunger_restore: 50,
    type: "pet",
    rarity: "Common",
    shop_cost: 100,
    image: "URL"
  },

  premium_pet_food: {
    id: "premium_pet_food",
    name: "Premium Pet Food",
    emoji: "🥩",
    description: "Feeds your pet fully and boosts EXP for 2 hours.",
    hunger_restore: 100,
    exp_boost: true,
    type: "pet",
    rarity: "Rare",
    shop_cost: 500,
    image: "URL"
  }

};

// Shop categories for /itemshop
const SHOP_POTIONS = Object.values(POTIONS).filter(p => p.shop_cost);

// Daily rotating shop pool (picks 4 random each day)
const DAILY_SHOP_POOL = ["hp_small", "hp_medium", "hp_large", "mana_potion", "elixir", "antidote", "pet_food", "speed_shard"];

module.exports = { POTIONS, SHOP_POTIONS, DAILY_SHOP_POOL };
