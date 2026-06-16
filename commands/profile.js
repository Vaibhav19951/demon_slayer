const fs = require("fs");
const path = require("path");
const { getPlayer, savePlayer, getWorldData } = require("../data/players");
const { getRankByLevel, isInjured } = require("../asset/solo_leveling/ranks");

const guildFile = path.join(process.cwd(), "data", "guild.json");

const safeReadGuilds = () => {
  try {
    if (fs.existsSync(guildFile)) return JSON.parse(fs.readFileSync(guildFile, "utf8"));
  } catch (e) {}
  return {};
};

// =========================================
// PROFILE BUILDER
// =========================================
const buildProfile = (player, username, guildName) => {
  const world = player.anime || "Demon Slayer";
  const worldData = getWorldData(player);
  const rankInfo = getRankByLevel(worldData.level || 1, world);

  const injured = isInjured(worldData);
  const injuredText = injured
    ? `\n⛔ *INJURED* — Stats at 50% (${Math.ceil((worldData.injured_until - Date.now()) / 60000)} min left)`
    : "";

  // Pet display
  const activePet = player.pets?.find(p => p.id === player.active_pet);
  const petText = activePet
    ? `🐾 *Pet:* \`${activePet.name}\` (${activePet.rarity})`
    : `🐾 *Pet:* \`None\``;

  // Title display
  const titleText = player.active_title
    ? `🏅 *Title:* \`${player.active_title}\``
    : `🏅 *Title:* \`None\``;

  // World emoji
  const worldEmoji = world === "Solo Leveling" ? "⚡" : "⚔️";

  // Shadow count (SL only)
  const shadowText = world === "Solo Leveling"
    ? `\n👥 *Shadow Army:* \`${worldData.shadows?.length || 0} soldiers\``
    : "";

  // XP bar
  const xp = worldData.xp || 0;
  const xpNeeded = worldData.xp_needed || 100;
  const xpPercent = Math.min(Math.floor((xp / xpNeeded) * 10), 10);
  const xpBar = "█".repeat(xpPercent) + "░".repeat(10 - xpPercent);

  return (
    `${worldEmoji} *SLAYER PROFILE — ${world.toUpperCase()}*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Name:* \`${username}\`\n` +
    `🏰 *Guild:* \`${guildName}\`\n` +
    `${titleText}\n` +
    `${petText}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📊 *RANK STATUS*\n` +
    `${rankInfo.color} *Rank:* \`${worldData.rank || rankInfo.name}\`\n` +
    `📈 *Level:* \`${worldData.level || 1}\`\n` +
    `🧪 *XP:* \`${xp}/${xpNeeded}\`\n` +
    `[${xpBar}]\n` +
    `🎴 *Character:* \`${worldData.character || "None"}\`\n` +
    `🎒 *Cards:* \`${worldData.inventory?.length || 0}\`${shadowText}${injuredText}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *WALLET*\n` +
    `🪙 *Coins:* \`${(player.coins || 0).toLocaleString()}\`\n` +
    `🏦 *Bank:* \`${(player.bank || 0).toLocaleString()}\`\n` +
    `💎 *Crystals:* \`${player.crystals || 0}\`\n` +
    `✨ *Mythic Tokens:* \`${player.mythic || 0}\`\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 *Streak:* \`${player.streak || 0} days\`\n` +
    `⚔️ *Battles Won:* \`${player.battles_won || 0}\`\n` +
    `💀 *Total Kills:* \`${player.total_kills || 0}\`\n` +
    `🏰 *Highest Floor:* \`${player.highest_dungeon_floor || 0}\``
  );
};

// =========================================
// INVENTORY VIEW
// =========================================
const buildInventory = (player) => {
  const worldData = getWorldData(player);
  const inventory = worldData.inventory || [];
  const weapons = worldData.owned_weapons || [];
  const potions = player.potions || {};

  let cardText = inventory.length === 0
    ? "_No cards yet! Use /spin to summon._"
    : inventory.slice(0, 10).map((item, i) => {
        const name = typeof item === "string" ? item : item.name;
        const lvl = typeof item === "string" ? 1 : (item.level || 1);
        return `\`${i + 1}.\` 🎴 **${name}** [Lv.${lvl}]`;
      }).join("\n") + (inventory.length > 10 ? `\n_...and ${inventory.length - 10} more_` : "");

  let weaponText = weapons.length === 0
    ? "_No weapons owned._"
    : weapons.slice(0, 5).map(w => {
        const name = typeof w === "string" ? w : w.name;
        return `⚔️ ${name}`;
      }).join("\n");

  let potionText = Object.entries(potions)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `🧪 ${key.replace(/_/g, " ")}: \`x${count}\``)
    .join("\n") || "_No potions._";

  return (
    `🎒 *INVENTORY*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🃏 *Cards (${inventory.length}):*\n${cardText}\n\n` +
    `⚔️ *Weapons (${weapons.length}):*\n${weaponText}\n\n` +
    `🧪 *Potions:*\n${potionText}`
  );
};

// =========================================
// PET VIEW
// =========================================
const buildPets = (player) => {
  const pets = player.pets || [];
  if (pets.length === 0) return `🐾 *PETS*\n━━━━━━━━━━━━━━━━━━━━━━━━\n_No pets yet! Use /incubate to hatch an egg._`;

  const petList = pets.map((p, i) => {
    const active = p.id === player.active_pet ? " ✅" : "";
    const hungry = p.hunger <= 0 ? " 😵 STARVING" : p.hunger <= 30 ? " 😟 Hungry" : "";
    return `\`${i + 1}.\` ${p.emoji || "🐾"} **${p.name}** [${p.rarity}]${active}${hungry}\n     └ ATK+${p.atk_bonus || 0} | Skill: ${p.skill || "None"}`;
  }).join("\n\n");

  return `🐾 *PETS (${pets.length})*\n━━━━━━━━━━━━━━━━━━━━━━━━\n${petList}`;
};

// =========================================
// PROFILE IMAGES PER WORLD
// =========================================
const PROFILE_IMAGES = {
  "Demon Slayer": "https://i.pinimg.com/736x/52/f5/97/52f597b5ed03c1f59f54aa656be46c7d.jpg",
  "Solo Leveling": "https://i.pinimg.com/1200x/7c/12/fc/7c12fcbe18cb7c7201a10c56a275820a.jpg"
};

// =========================================
// MODULE EXPORT
// =========================================
module.exports = (bot) => {

  bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const player = getPlayer(userId);
    const guilds = safeReadGuilds();
    const guildName = player.guildId && guilds[player.guildId] ? guilds[player.guildId].name : "No Guild";
    const world = player.anime || "Demon Slayer";

    const caption = buildProfile(player, msg.from.first_name, guildName);

    try {
      await bot.sendPhoto(chatId, PROFILE_IMAGES[world] || PROFILE_IMAGES["Demon Slayer"], {
        caption,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🎒 Inventory", callback_data: `prf_inv:${userId}` },
              { text: "🐾 Pets", callback_data: `prf_pet:${userId}` }
            ],
            [
              { text: "🏰 Guild", callback_data: `prf_gld:${userId}` },
              { text: "🔄 Refresh", callback_data: `prf_main:${userId}` }
            ]
          ]
        }
      });
    } catch (err) {
      console.error("❌ Profile error:", err.message);
      bot.sendMessage(chatId, caption, { parse_mode: "Markdown" });
    }
  });

  // =========================================
  // CALLBACK HANDLER
  // =========================================
  bot.on("callback_query", async (query) => {
    if (!/^prf_(main|inv|pet|gld):/.test(query.data)) return;

    const [actionPart, userId] = query.data.split(":");
    const action = actionPart.replace("prf_", "");
    const clickerId = query.from.id.toString();

    if (clickerId !== userId) {
      return bot.answerCallbackQuery(query.id, {
        text: "❌ This is not your profile!",
        show_alert: true
      });
    }

    const player = getPlayer(userId);
    const guilds = safeReadGuilds();
    const guildName = player.guildId && guilds[player.guildId] ? guilds[player.guildId].name : "No Guild";

    let caption = "";

    if (action === "main") {
      caption = buildProfile(player, query.from.first_name, guildName);
    } else if (action === "inv") {
      caption = buildInventory(player);
    } else if (action === "pet") {
      caption = buildPets(player);
    } else if (action === "gld") {
      caption =
        `🏰 *GUILD INFO*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🔹 *Guild:* \`${guildName}\`\n` +
        `🔹 *Guild ID:* \`${player.guildId || "None"}\`\n\n` +
        `_Use /guild to manage your guild._`;
    }

    try {
      await bot.editMessageCaption(caption, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🎒 Inventory", callback_data: `prf_inv:${userId}` },
              { text: "🐾 Pets", callback_data: `prf_pet:${userId}` }
            ],
            [
              { text: "🏰 Guild", callback_data: `prf_gld:${userId}` },
              { text: "🔄 Refresh", callback_data: `prf_main:${userId}` }
            ]
          ]
        }
      });
    } catch (err) {
      console.log("⚠️ Profile refresh skipped");
    }

    bot.answerCallbackQuery(query.id);
  });
};
