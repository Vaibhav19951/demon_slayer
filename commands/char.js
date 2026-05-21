console.log("✅ LIVE RECOGNITION REGISTRY & TRADING SYSTEM LOADED");

const fs = require("fs");
const path = require("path");

const playerFile = path.join(__dirname, "../data/players.json");

// ADMIN ID CHECK
const ADMIN_ID = "2086993762";

// LOAD CENTRAL CATALOG FILES SAFELY
let normalAssets = [];
let mythicalAssets = [];

try { normalAssets = require("../asset/assets"); } catch { normalAssets = []; }
try { mythicalAssets = require("../asset/mythical"); } catch { mythicalAssets = []; }

// Universal helper to find asset data safely by original string ID
const findCharacterInAssets = (id) => {
  if (!id) return null;
  const query = id.toString().trim().toLowerCase();
  
  if (Array.isArray(normalAssets)) {
    const found = normalAssets.find(c => c.id && c.id.toString().toLowerCase().trim() === query);
    if (found) return { ...found, rarity: "⭐ Normal" };
  }
  
  if (Array.isArray(mythicalAssets)) {
    const found = mythicalAssets.find(c => c.id && c.id.toString().toLowerCase().trim() === query);
    if (found) return { ...found, rarity: "🔥 MYTHICAL" };
  }
  
  return null;
};

// HELPER FUNCTIONS FOR FILE I/O
const loadPlayersData = () => {
  try { return JSON.parse(fs.readFileSync(playerFile, "utf8")); } catch (e) { return {}; }
};
const savePlayersData = (data) => {
  fs.writeFileSync(playerFile, JSON.stringify(data, null, 2));
};

module.exports = (bot) => {

  // ==========================================
  // 📜 1. /charlist — DISPLAY ALL CORRECT IDS
  // ==========================================
  bot.onText(/\/charlist/, (msg) => {
    const chatId = msg.chat.id;

    let text = "⚔️ **OFFICIAL DEMON SLAYER REGISTRY** ⚔️\n\n";

    text += "⭐ **NORMAL CHARACTERS**\n";
    if (Array.isArray(normalAssets) && normalAssets.length > 0) {
      normalAssets.forEach(c => {
        text += `• ID: \`${c.id}\` — **${c.name}** (${c.type || "Breath"})\n`;
      });
    } else { text += "_No normal characters loaded_\n"; }

    text += "\n🔥 **MYTHICAL TIER CHARACTERS**\n";
    if (Array.isArray(mythicalAssets) && mythicalAssets.length > 0) {
      mythicalAssets.forEach(c => {
        text += `• ID: \`${c.id}\` — **${c.name}** (${c.type || "Breath"})\n`;
      });
    } else { text += "_No mythical characters loaded_\n"; }

    text += "\nℹ️ *Use these exact code IDs inside backticks (\`) to gift, add, or trade slayers!*";
    
    bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  });


  // ==========================================
  // 🔨 2. /addchar [OWNER COMMAND — WITH AUTO IMAGE SHOW]
  // ==========================================
  // Syntax: /addchar PLAYER_ID | CHARACTER_ID
  bot.onText(/\/addchar (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const adminUserId = msg.from.id.toString();

    if (adminUserId !== ADMIN_ID) {
      return bot.sendMessage(chatId, "❌ Unauthorized! Only the Head Slayer can add global assets.");
    }

    const input = match[1];
    const parts = input.split("|");

    if (parts.length < 2) {
      return bot.sendMessage(chatId, "❌ **Format:** `/addchar PlayerID | CharacterID`\nExample: `/addchar 12345678 | tanjiro_water`", { parse_mode: "Markdown" });
    }

    const targetPlayerId = parts[0].trim();
    const charId = parts[1].trim();

    const matchedAsset = findCharacterInAssets(charId);
    if (!matchedAsset) {
      return bot.sendMessage(chatId, `❌ **ID \`${charId}\` not found!** Type \`/charlist\` to verify existing catalog codes.`);
    }

    const currentPlayers = loadPlayersData();

    if (!currentPlayers[targetPlayerId]) {
      currentPlayers[targetPlayerId] = { coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, lastDaily: 0, mythicalCrystals: 5, rank: "Mizunoto (Rookie)", character: "Not Selected", inventory: [] };
    }
    if (!currentPlayers[targetPlayerId].inventory) { currentPlayers[targetPlayerId].inventory = []; }

    const inventoryString = `${matchedAsset.id}|${matchedAsset.name}|${matchedAsset.type || "Breath Style"}`;

    const alreadyOwns = currentPlayers[targetPlayerId].inventory.some(item => item.split("|")[0].toLowerCase() === matchedAsset.id.toLowerCase());
    if (alreadyOwns) {
      return bot.sendMessage(chatId, `⚠️ Target player already owns **${matchedAsset.name}**.`);
    }

    currentPlayers[targetPlayerId].inventory.push(inventoryString);
    savePlayersData(currentPlayers);

    // AUTOMATIC IMAGE GENERATION IMMEDIATELY UPON SUCCESSFUL ADDITION
    bot.sendPhoto(chatId, matchedAsset.image, {
      caption: `🎁 **OWNER GIFT GRANTED SUCCESSFUL!**\n\n👤 **To Player:** \`${targetPlayerId}\`\n🆔 **Character ID:** \`${matchedAsset.id}\`\n⚔️ **Name:** ${matchedAsset.name}\n✨ **Rarity:** ${matchedAsset.rarity}\n📁 **Style:** ${matchedAsset.type || "Breath Style"}`,
      parse_mode: "Markdown"
    });
  });


  // ==========================================
  // 🤝 3. /givechar [PLAYER TRADING SYSTEM — WITH AUTO IMAGE SHOW]
  // ==========================================
  // Syntax: /givechar TARGET_PLAYER_ID | CHARACTER_ID
  bot.onText(/\/givechar (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id.toString();

    const input = match[1];
    const parts = input.split("|");

    if (parts.length < 2) {
      return bot.sendMessage(chatId, "❌ **How to trade/gift:** \nUse: `/givechar FriendPlayerID | CharacterID`\nExample: `/givechar 87654321 | tanjiro_water`", { parse_mode: "Markdown" });
    }

    const receiverId = parts[0].trim();
    const tradeCharId = parts[1].trim().toLowerCase();

    if (senderId === receiverId) {
      return bot.sendMessage(chatId, "⚠️ App khud ko character trade nahi kar sakte!");
    }

    const currentPlayers = loadPlayersData();

    // Verification Layer 1: Sender validation
    if (!currentPlayers[senderId] || !currentPlayers[senderId].inventory || currentPlayers[senderId].inventory.length === 0) {
      return bot.sendMessage(chatId, "❌ Aapka character inventory bilkul empty hai!");
    }

    // Find the string inside sender's collection array
    const senderInvIndex = currentPlayers[senderId].inventory.findIndex(item => item.split("|")[0].toLowerCase() === tradeCharId);

    if (senderInvIndex === -1) {
      return bot.sendMessage(chatId, `❌ Aapke paas ID \`${tradeCharId}\` ka character nahi hai!`);
    }

    const assetMeta = findCharacterInAssets(tradeCharId);
    if (!assetMeta) {
      return bot.sendMessage(chatId, "❌ Setup Asset Data matching missing.");
    }

    // Initialize receiver safely if they are a completely new profile
    if (!currentPlayers[receiverId]) {
      currentPlayers[receiverId] = { coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, lastDaily: 0, mythicalCrystals: 5, rank: "Mizunoto (Rookie)", character: "Not Selected", inventory: [] };
    }
    if (!currentPlayers[receiverId].inventory) { currentPlayers[receiverId].inventory = []; }

    // Verification Layer 2: Receiver duplicate check
    const receiverHasIt = currentPlayers[receiverId].inventory.some(item => item.split("|")[0].toLowerCase() === tradeCharId);
    if (receiverHasIt) {
      return bot.sendMessage(chatId, `⚠️ Target player ke paas pehle se **${assetMeta.name}** maujood hai.`);
    }

    // ATOMIC TRANSACTION MUTATION
    const [tradedCharacterString] = currentPlayers[senderId].inventory.splice(senderInvIndex, 1);
    currentPlayers[receiverId].inventory.push(tradedCharacterString);
    savePlayersData(currentPlayers);

    // AUTOMATIC IMAGE GENERATION IMMEDIATELY UPON SUCCESSFUL TRADE TRANSFER
    bot.sendPhoto(chatId, assetMeta.image, {
      caption: `🤝 **CHARACTER TRANSFER SUCCESSFUL!**\n\n📤 **From:** [User](tg://user?id=${senderId})\n📥 **To Player:** [Receiver](tg://user?id=${receiverId})\n\n⚔️ **Traded Character:** ${assetMeta.name}\n🆔 **Asset ID:** \`${assetMeta.id}\`\n✨ **Tier:** ${assetMeta.rarity}`,
      parse_mode: "Markdown"
    });
  });


  // ==========================================
  // 📦 4. /viewchar (PLAYER PERSONAL INVENTORY)
  // ==========================================
  bot.onText(/\/viewchar/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const currentPlayers = loadPlayersData();
    const player = currentPlayers[userId];

    if (!player || !player.inventory || player.inventory.length === 0) {
      return bot.sendMessage(chatId, "❌ Your character inventory is empty!");
    }

    let text = "📦 **YOUR PERSONAL SQUAD INVENTORY**\n\n";
    let buttons = [];

    player.inventory.forEach(c => {
      const [id, name, type] = c.split("|");
      const assetMeta = findCharacterInAssets(id);
      const tierTag = assetMeta ? assetMeta.rarity : "⭐ Standard";

      text += `🆔 \`${id}\` — **${name}** [${tierTag}]\n`;

      buttons.push([{ text: `🖼 View ${name}`, callback_data: `viewcard|${userId}|${id}` }]);
    });

    bot.sendMessage(chatId, text, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons }
    });
  });

  // Inline view verification logic remains intact
  bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const clickingUserId = query.from.id.toString();

    if (!data.startsWith("viewcard|")) return;
    const [, ownerId, id] = data.split("|");

    if (clickingUserId !== ownerId) {
      return bot.answerCallbackQuery(query.id, { text: "❌ Yeh aapki inventory nahi hai!", show_alert: true });
    }

    const currentPlayers = loadPlayersData();
    if (!currentPlayers[ownerId] || !currentPlayers[ownerId].inventory.some(c => c.startsWith(`${id}|`))) {
      return bot.sendMessage(chatId, "❌ Verification Failed.");
    }

    const assetMeta = findCharacterInAssets(id);
    if (assetMeta && assetMeta.image) {
      bot.sendPhoto(chatId, assetMeta.image, {
        caption: `⚔️ **Name:** ${assetMeta.name}\n✨ **Tier:** ${assetMeta.rarity}\n🆔 **Asset ID:** \`${id}\``,
        parse_mode: "Markdown"
      });
    }
    bot.answerCallbackQuery(query.id);
  });

};
