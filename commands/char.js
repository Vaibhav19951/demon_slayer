console.log("✅ REPLY & TAG TRADING SYSTEM LOADED");

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

// Helper to find asset data safely by original string ID
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

// Helper to find a user's ID by their username from the existing database
const findUserIdByUsername = (currentPlayers, username) => {
  const cleanUsername = username.replace("@", "").toLowerCase().trim();
  return Object.keys(currentPlayers).find(id => {
    // Note: This relies on your registration saving usernames inside players.json
    // If you don't save usernames, the Reply method below is 100% bulletproof.
    return currentPlayers[id].username && currentPlayers[id].username.toLowerCase() === cleanUsername;
  });
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
      normalAssets.forEach(c => { text += `• ID: \`${c.id}\` — **${c.name}**\n`; });
    } else { text += "_No normal characters loaded_\n"; }

    text += "\n🔥 **MYTHICAL TIER CHARACTERS**\n";
    if (Array.isArray(mythicalAssets) && mythicalAssets.length > 0) {
      mythicalAssets.forEach(c => { text += `• ID: \`${c.id}\` — **${c.name}**\n`; });
    } else { text += "_No mythical characters loaded_\n"; }
    
    bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  });

  // ==========================================
  // 🔨 2. /addchar [OWNER COMMAND]
  // ==========================================
  bot.onText(/\/addchar (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const adminUserId = msg.from.id.toString();
    if (adminUserId !== ADMIN_ID) return bot.sendMessage(chatId, "❌ Unauthorized!");

    const parts = match[1].split("|");
    if (parts.length < 2) return bot.sendMessage(chatId, "❌ Use: `/addchar PlayerID | CharID` ");

    const targetPlayerId = parts[0].trim();
    const charId = parts[1].trim();

    const matchedAsset = findCharacterInAssets(charId);
    if (!matchedAsset) return bot.sendMessage(chatId, `❌ ID \`${charId}\` not found!`);

    const currentPlayers = loadPlayersData();
    if (!currentPlayers[targetPlayerId]) {
      currentPlayers[targetPlayerId] = { coins: 1000, level: 1, inventory: [] };
    }
    
    const inventoryString = `${matchedAsset.id}|${matchedAsset.name}|${matchedAsset.type || "Breath Style"}`;
    if (currentPlayers[targetPlayerId].inventory.some(item => item.split("|")[0].toLowerCase() === matchedAsset.id.toLowerCase())) {
      return bot.sendMessage(chatId, "⚠️ Already owns this character.");
    }

    currentPlayers[targetPlayerId].inventory.push(inventoryString);
    savePlayersData(currentPlayers);

    bot.sendPhoto(chatId, matchedAsset.image, {
      caption: `🎁 **OWNER GIFT GRANTED!**\n👤 **To:** \`${targetPlayerId}\`\n⚔️ **Character:** ${matchedAsset.name}`,
      parse_mode: "Markdown"
    });
  });

  // ==========================================
  // 🤝 3. /givechar [SMART TRADING: REPLY OR TAG]
  // ==========================================
  bot.onText(/\/givechar(?: (.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id.toString();
    const rawInput = match[1] || "";

    let receiverId = null;
    let tradeCharId = null;

    // METHOD A: USER REPLIED TO A MESSAGE
    if (msg.reply_to_message) {
      receiverId = msg.reply_to_message.from.id.toString();
      // Reply case mein format sirf "/givechar character_id" ya "/givechar | character_id" ho sakta hai
      tradeCharId = rawInput.replace("|", "").trim().toLowerCase();
    } 
    // METHOD B: USER TAGGED SOMEONE (e.g., /givechar @username | char_id)
    else {
      const parts = rawInput.split("|");
      if (parts.length < 2) {
        return bot.sendMessage(chatId, "💡 **Kaise trade karein?**\n\n1. Kisi ke message par **Reply** karke likho:\n   `/givechar tanjiro_water`\n\n2. Ya fir dost ko **Tag** karke likho:\n   `/givechar @username | tanjiro_water`", { parse_mode: "Markdown" });
      }

      const targetTag = parts[0].trim();
      tradeCharId = parts[1].trim().toLowerCase();

      const currentPlayers = loadPlayersData();
      receiverId = findUserIdByUsername(currentPlayers, targetTag);

      if (!receiverId) {
        return bot.sendMessage(chatId, `❌ System dost ke username \`${targetTag}\` ko recognize nahi kar paa raha hai. Unse kahein ki group mein ek baar \`/start\` ya \`/profile\` chalayein.`);
      }
    }

    if (!tradeCharId) {
      return bot.sendMessage(chatId, "❌ Character ID dena zaroori hai! Example: `/givechar tanjiro_water`");
    }

    if (senderId === receiverId) {
      return bot.sendMessage(chatId, "⚠️ Aap khud ko character trade nahi kar sakte!");
    }

    const currentPlayers = loadPlayersData();

    // Sender validation
    if (!currentPlayers[senderId] || !currentPlayers[senderId].inventory || currentPlayers[senderId].inventory.length === 0) {
      return bot.sendMessage(chatId, "❌ Aapka character inventory khali hai!");
    }

    const senderInvIndex = currentPlayers[senderId].inventory.findIndex(item => item.split("|")[0].toLowerCase() === tradeCharId);
    if (senderInvIndex === -1) {
      return bot.sendMessage(chatId, `❌ Aapke paas ID \`${tradeCharId}\` ka character nahi hai!`);
    }

    const assetMeta = findCharacterInAssets(tradeCharId);
    if (!assetMeta) return bot.sendMessage(chatId, "❌ Asset match missing.");

    // Receiver initialization safely
    if (!currentPlayers[receiverId]) {
      currentPlayers[receiverId] = { coins: 1000, level: 1, inventory: [] };
    }
    if (!currentPlayers[receiverId].inventory) currentPlayers[receiverId].inventory = [];

    // Receiver duplicate check
    const receiverHasIt = currentPlayers[receiverId].inventory.some(item => item.split("|")[0].toLowerCase() === tradeCharId);
    if (receiverHasIt) {
      return bot.sendMessage(chatId, `⚠️ Samne wale ke paas pehle se **${assetMeta.name}** maujood hai.`);
    }

    // TRANSACTION MUTATION
    const [tradedCharacterString] = currentPlayers[senderId].inventory.splice(senderInvIndex, 1);
    currentPlayers[receiverId].inventory.push(tradedCharacterString);
    savePlayersData(currentPlayers);

    // AUTOMATIC IMAGE POP-UP
    bot.sendPhoto(chatId, assetMeta.image, {
      caption: `🤝 **TRADE SUCCESSFUL!**\n\n📤 **From:** [User](tg://user?id=${senderId})\n📥 **To:** [Receiver](tg://user?id=${receiverId})\n\n⚔️ **Traded:** ${assetMeta.name}\n🆔 **ID:** \`${assetMeta.id}\` `,
      parse_mode: "Markdown"
    });
  });

  // ==========================================
  // 📦 4. /viewchar
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

    bot.sendMessage(chatId, text, { parse_mode: "Markdown", reply_markup: { inline_keyboard: buttons } });
  });

  // Inline callback verification logic
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
