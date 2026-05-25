/**
 * VELIX OS V2.5 | CHARACTER GRID REGISTRY & SECURE TRADING MATRIX
 * Fully Integrated with Centralized Ledger Hook & Object-Based Inventories
 * Thread-Safe Data Mutation Protocol with Perimeter Isolated Callback Guards
 */

// Pulling existing card databases seamlessly
const { characters: normalCards } = require("../asset/assets.js");
const { mythical: mythicCards } = require("../asset/mythical.js");

console.log("📇 [LOADED SUCCESS] Independent Character & Trade Matrix Synced: char.js");

module.exports = (bot) => {

  // Resolves handle tags (@Velix) down to raw user registry indicators inside memory context
  const resolveUserByTag = (mentionStr) => {
    const cleanTag = mentionStr.replace("@", "").trim().toLowerCase();
    // Since global dataset is parsed dynamically, lookup flows via runtime parameters
    return null; // Fallback placeholder if custom cache arrays are separate
  };

  // Temporary transaction state memory mapped array packets
  const activeTrades = {};

  // ==========================================
  // 📋 1. GLOBAL CARD DIRECTORY INDEX (/charlist)
  // ==========================================
  bot.onText(/\/charlist/, async (msg) => {
    const chatId = msg.chat.id;

    const inlineKeyboard = [
      [
        { text: "🟢 View All Normal Cards", callback_data: "global_list_normal" },
        { text: "👑 View All Mythical Cards", callback_data: "global_list_mythic" }
      ]
    ];

    await bot.sendMessage(chatId, 
      `🗇 **VELIX OS | GLOBAL CHARACTER DIRECTORY**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Select a faction rarity tier group below to index every archetype registered within the central database framework along with their unique identifier keys:`, 
      {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: inlineKeyboard }
      }
    ).catch(e => console.error(e.message));
  });

  // ==========================================
  // 🔍 2. GLOBAL CHARACTER DIRECTORY (/char)
  // ==========================================
  bot.onText(/\/char$/, async (msg) => {
    const chatId = msg.chat.id;
    
    const allUniqueKeys = Array.from(new Set([...Object.keys(normalCards || {}), ...Object.keys(mythicCards || {})]));
    
    if (allUniqueKeys.length === 0) {
      return bot.sendMessage(chatId, "⚠️ **System Notification:** The global character registry configuration files are vacant.", { parse_mode: "Markdown" });
    }

    const keyboard = [];
    allUniqueKeys.slice(0, 15).forEach((key) => { // Sliced to prevent hitting Telegram maximum button limits
      const cardModule = (normalCards[key] || mythicCards[key]);
      if (cardModule) {
        const cardName = cardModule.name || key;
        keyboard.push([{ text: `📇 Profile: ${cardName}`, callback_data: `vlist_${key}` }]);
      }
    });

    await bot.sendMessage(chatId, 
      `📜 **VELIX OS | DEMON SLAYER CHARACTER REGISTRY**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Select a warrior archetype from the dynamic grid below to review visual layout specifications, metrics, and profile logs:`, 
      {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: keyboard }
      }
    ).catch(e => console.error(e.message));
  });

  // Target quick lookups like /char tanjiro
  bot.onText(/\/char\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const input = match[1].trim();
    if (input.startsWith("@") || input.includes("|")) return; // Avoids conflict boundaries with admin / trade parameters

    const searchInput = input.toLowerCase().replace(/\s+/g, "_");
    const hasNormal = normalCards && normalCards[searchInput] ? true : false;
    const hasMythic = mythicCards && mythicCards[searchInput] ? true : false;

    if (!hasNormal && !hasMythic) {
      return bot.sendMessage(chatId, `❌ **System Registry Error:** Character profile matrix \`"${match[1]}"\` could not be mapped inside storage indexes.`);
    }

    const buttons = [];
    const charName = (hasNormal ? normalCards[searchInput].name : mythicCards[searchInput].name);

    if (hasNormal) buttons.push({ text: "🟢 Normal Specs", callback_data: `vchar_${searchInput}_normal` });
    if (hasMythic) buttons.push({ text: "👑 Mythic Specs", callback_data: `vchar_${searchInput}_mythic` });

    await bot.sendMessage(chatId, `🔍 **VELIX OS | CHARACTER CELL LOCATED: ${charName.toUpperCase()}**\nChoose target configuration variation layer:`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [buttons] }
    });
  });

  // ==========================================
  // 👑 3. ADMIN INVENTORY DROP PROTOCOL (/addchar)
  // ==========================================
  bot.onText(/\/addchar\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id.toString();

    const ADMIN_ID = "2086993762"; // Velix OS Operator Unique Master Identifier
    if (senderId !== ADMIN_ID) return;

    const parts = match[1].trim().split(/\s+/);
    if (parts.length < 2) {
      return bot.sendMessage(chatId, "❌ **Execution Syntax Refused:** Use alignment format: \`/addchar <user_id_or_tag> <card_key_id>\`", { parse_mode: "Markdown" });
    }

    const [userTarget, cardKeyInput] = parts;
    const cardId = cardKeyInput.toLowerCase().replace(/\s+/g, "_");
    
    // Standardizing targeted index boundaries
    let targetUserId = userTarget.replace("@", "");

    const hasNormal = normalCards && normalCards[cardId] ? true : false;
    const hasMythic = mythicCards && mythicCards[cardId] ? true : false;

    if (!hasNormal && !hasMythic) {
      return bot.sendMessage(chatId, `❌ **Database Refusal:** Character identifier mapping node \`${cardId}\` does not exist inside internal files.`, { parse_mode: "Markdown" });
    }

    const buttons = [];
    if (hasNormal) buttons.push({ text: "🟢 Inject Normal", callback_data: `own_drop_${targetUserId}_${cardId}_normal` });
    if (hasMythic) buttons.push({ text: "👑 Inject Mythical", callback_data: `own_drop_${targetUserId}_${cardId}_mythic` });

    await bot.sendMessage(chatId, `🎁 **VELIX OS | ADMIN SYSTEM DROPS**\nChoose target matrix rarity structural layer to transfer down to client node \`${targetUserId}\`:`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: [buttons] }
    });
  });

  // ==========================================
  // 🤝 4. SYSTEM-SYNCHRONIZED P2P TRADING (/tradechar)
  // ==========================================
  bot.onText(/\/tradechar\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id.toString();

    const input = match[1].split("|").map(item => item.trim());
    if (input.length < 5) {
      return bot.sendMessage(chatId, `❌ **Mapping Layout Malfunction!**\n👉 *Usage:* \`/tradechar <Target_User_ID> | MyCardName | MyRarity | TheirCardName | TheirRarity\``, { parse_mode: "Markdown" });
    }

    const [targetMention, myCardName, myRarity, theirCardName, theirRarity] = input;
    const cleanMyRarity = myRarity.toLowerCase();
    const cleanTheirRarity = theirRarity.toLowerCase();

    // Verification of trading equivalence rules
    if (cleanMyRarity !== cleanTheirRarity) {
      return bot.sendMessage(chatId, "❌ **Transaction Validation Denied:** Faction trading parameters enforce structural parity. Normal cards can only trade for Normal items, and Mythics for Mythics.", { parse_mode: "Markdown" });
    }

    const receiverId = targetMention.replace("@", "").trim();

    if (senderId === receiverId) {
      return bot.sendMessage(chatId, "❌ **Transaction Core Refusal:** Loop restriction active. Self-routing transaction vectors are invalid.", { parse_mode: "Markdown" });
    }

    // Pull users via synchronized engine layers
    const senderProfile = bot.getPlayerData ? bot.getPlayerData(senderId) : null;
    const receiverProfile = bot.getPlayerData ? bot.getPlayerData(receiverId) : null;

    if (!senderProfile || !receiverProfile) {
      return bot.sendMessage(chatId, "❌ **Transaction Aborted:** One or both user profile matrix blocks failed to initialize inside centralized ledger nodes.", { parse_mode: "Markdown" });
    }

    if (!senderProfile.inventory) senderProfile.inventory = [];
    if (!receiverProfile.inventory) receiverProfile.inventory = [];

    // Upgraded Object Standard Scan Verification Loops
    const senderOwns = senderProfile.inventory.some(item => {
      const itemName = typeof item === "string" ? item : (item.name || "");
      const itemRarity = item.type || "normal";
      return itemName.toLowerCase().includes(myCardName.toLowerCase()) && 
             (cleanMyRarity === "mythic" ? itemRarity.includes("mythic") : !itemRarity.includes("mythic"));
    });

    const receiverOwns = receiverProfile.inventory.some(item => {
      const itemName = typeof item === "string" ? item : (item.name || "");
      const itemRarity = item.type || "normal";
      return itemName.toLowerCase().includes(theirCardName.toLowerCase()) && 
             (cleanTheirRarity === "mythic" ? itemRarity.includes("mythic") : !itemRarity.includes("mythic"));
    });

    if (!senderOwns) return bot.sendMessage(chatId, `❌ **Trade Vector Refused:** You do not own any structural variant matching \`${myCardName}\` inside your ledger arrays.`, { parse_mode: "Markdown" });
    if (!receiverOwns) return bot.sendMessage(chatId, `❌ **Trade Vector Refused:** Target trading partner doesn't possess any structural variant matching \`${theirCardName}\`.`, { parse_mode: "Markdown" });

    const tradeId = `t_${Date.now()}`;
    activeTrades[tradeId] = {
      sender: senderId,
      receiver: receiverId,
      senderCardName: myCardName,
      senderRarity: cleanMyRarity,
      receiverCardName: theirCardName,
      receiverRarity: cleanTheirRarity
    };

    await bot.sendMessage(chatId, 
      `🤝 **VELIX OS | SECURE ESCROW TRANSACTION GENERATED**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 **Sender Outgoing Offer:** \`${myCardName.toUpperCase()} [${cleanMyRarity.toUpperCase()}]\`\n` +
      `👤 **Recipient Incoming Demand:** \`${theirCardName.toUpperCase()} [${cleanTheirRarity.toUpperCase()}]\`\n\n` +
      `*Target confirmation recipient must initialize authorization click below:*`, 
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Authorize Escrow Swap", callback_data: `char_t_acc_${tradeId}` },
              { text: "❌ Terminate Session", callback_data: `char_t_dec_${tradeId}` }
            ]
          ]
        }
      }
    );
  });

  // ==========================================
  // 🎮 5. PERIMETER ISOLATED CALLBACK QUERIES
  // ==========================================
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const clickerId = query.from.id.toString();
    const data = query.data;

    // Guard checking if callback data belongs to this module context strictly
    const isCharListMode = data === "global_list_normal" || data === "global_list_mythic";
    const isVListMode = data.startsWith("vlist_");
    const isVCharMode = data.startsWith("vchar_");
    const isTradeMode = data.startsWith("char_t_");
    const isAdminDropMode = data.startsWith("own_drop_");

    if (!isCharListMode && !isVListMode && !isVCharMode && !isTradeMode && !isAdminDropMode) return;

    bot.answerCallbackQuery(query.id);

    // 1. GLOBAL DATABASE MAP INTERPRETER BLOCK
    if (isCharListMode) {
      const targetDB = (data === "global_list_mythic") ? mythicCards : normalCards;
      const targetLabel = (data === "global_list_mythic") ? "👑 MYTHICAL" : "🟢 NORMAL";
      const dbKeys = Object.keys(targetDB || {});

      if (dbKeys.length === 0) {
        return bot.sendMessage(chatId, `⚠️ **System Index Alert:** The global **${targetLabel}** registries are empty.`, { parse_mode: "Markdown" });
      }

      let responseMessage = `📋 **VELIX OS | ${targetLabel} ARCHETYPE REGISTER**\n` +
                            `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      dbKeys.forEach((key, index) => {
        const card = targetDB[key];
        responseMessage += `${index + 1}. 🎴 **${card.name || key}**\n   🔑 Registry ID: \`${key}\` | ⚡ Elemental Type: \`${card.type || "Unset"}\`\n\n`;
      });

      return bot.sendMessage(chatId, responseMessage, { parse_mode: "Markdown" });
    }

    // 2. DISPATCH SPECIFIC VARIANT OPTIONS MENU
    if (isVListMode) {
      const cardKey = data.replace("vlist_", "");
      const buttons = [];
      if (normalCards && normalCards[cardKey]) buttons.push({ text: "🟢 Normal Version", callback_data: `vchar_${cardKey}_normal` });
      if (mythicCards && mythicCards[cardKey]) buttons.push({ text: "👑 Mythic Version", callback_data: `vchar_${cardKey}_mythic` });

      return bot.sendMessage(chatId, `✨ **Configuration Strata Remapped:**\nSelect visual grid specifications framework path:`, {
        reply_markup: { inline_keyboard: [buttons] }
      });
    }

    // 3. RENDER DESIGNATED PROFILE DATA SHEETS
    if (isVCharMode) {
      const [_, charKey, rarity] = data.split("_");
      const cardData = (rarity === "mythic") ? (mythicCards ? mythicCards[charKey] : null) : (normalCards ? normalCards[charKey] : null);

      if (!cardData) return;

      const player = bot.getPlayerData ? bot.getPlayerData(clickerId) : { inventory: [] };
      if (!player.inventory) player.inventory = [];

      const cardName = cardData.name || charKey;
      
      const ownsCard = player.inventory.some(item => {
        const itemName = typeof item === "string" ? item : (item.name || "");
        return itemName.toLowerCase().includes(cardName.toLowerCase());
      });
      
      const statusText = ownsCard ? "✅ **Registry Clearance:** Owned within your active squad profiles!" : "❌ **Registry Clearance:** Unowned core frame module.";
      const rarityTag = rarity === "mythic" ? "👑 MYTHIC APEX" : "🟢 NORMAL LAYER";
      
      const captionMessage = `✨ **VELIX OS | INTEL DATABASE DISPLAY**\n` +
                             `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                             `🎴 **Identity:** \`${cardName}\` [${rarityTag}]\n` +
                             `❤️ **HP Core Capacity:** \`${cardData.hp || 100}\` | ⚔️ **ATK Lethality:** \`${cardData.atk || 10}\`\n` +
                             `📝 **System Specifications Logs:** *${cardData.desc || "No custom logs provided."}*\n` +
                             `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                             `${statusText}`;

      const cardImage = cardData.img || cardData.image || cardData.url;

      if (cardImage && String(cardImage).startsWith("http")) {
        return bot.sendPhoto(chatId, cardImage, { caption: captionMessage, parse_mode: "Markdown" }).catch(() => {
          bot.sendMessage(chatId, captionMessage, { parse_mode: "Markdown" });
        });
      } else {
        return bot.sendMessage(chatId, captionMessage, { parse_mode: "Markdown" });
      }
    }

    // 4. ADMIN SECTOR DROP DIRECT MUTATION LOGIC
    if (isAdminDropMode) {
      const [_, __, targetUserId, cardId, rarity] = data.split("_");
      
      const targetProfile = bot.getPlayerData ? bot.getPlayerData(targetUserId) : null;
      if (!targetProfile) return;
      if (!targetProfile.inventory) targetProfile.inventory = [];

      const assetSource = rarity === "mythic" ? mythicCards[cardId] : normalCards[cardId];
      if (!assetSource) return;

      targetProfile.inventory.push({
        id: cardId,
        name: assetSource.name || cardId,
        type: rarity === "mythic" ? "mythic_slayer" : "normal_slayer",
        level: 1,
        power: parseInt(assetSource.power || assetSource.atk, 10) || 200,
        acquiredAt: new Date().toISOString()
      });

      if (bot.savePlayerData) bot.savePlayerData(targetUserId, targetProfile);

      bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
      return bot.sendMessage(chatId, `🎁 **VELIX OS CORE OVERRIDE:** Successfully injected \`${assetSource.name} [${rarity.toUpperCase()}]\` down into client core inventory array pipeline \`${targetUserId}\`.`);
    }

    // 5. TRANSACTION SECURITY ACCEPT PROTOCOL
    if (data.startsWith("char_t_acc_")) {
      const tradeId = data.replace("char_t_acc_", "");
      const trade = activeTrades[tradeId];

      if (!trade) return bot.sendMessage(chatId, "❌ **Transaction Timeout:** The requested trade tracking structure session expired.");
      if (clickerId !== trade.receiver) return; // Action lock barrier

      const senderProfile = bot.getPlayerData ? bot.getPlayerData(trade.sender) : null;
      const receiverProfile = bot.getPlayerData ? bot.getPlayerData(trade.receiver) : null;

      if (!senderProfile || !receiverProfile) return;

      const sIndex = senderProfile.inventory.findIndex(item => {
        const name = typeof item === "string" ? item : (item.name || "");
        return name.toLowerCase().includes(trade.senderCardName.toLowerCase());
      });

      const rIndex = receiverProfile.inventory.findIndex(item => {
        const name = typeof item === "string" ? item : (item.name || "");
        return name.toLowerCase().includes(trade.receiverCardName.toLowerCase());
      });

      if (sIndex === -1 || rIndex === -1) {
        delete activeTrades[tradeId];
        return bot.sendMessage(chatId, "❌ **Transaction Failure:** State verification sequence detected a missing item token artifact right before completion. Swapping aborted.");
      }

      // Safe shifting array indexes elements
      const [sItem] = senderProfile.inventory.splice(sIndex, 1);
      const [rItem] = receiverProfile.inventory.splice(rIndex, 1);

      senderProfile.inventory.push(rItem);
      receiverProfile.inventory.push(sItem);

      // Save centralized records state mutations
      if (bot.savePlayerData) {
        bot.savePlayerData(trade.sender, senderProfile);
        bot.savePlayerData(trade.receiver, receiverProfile);
      }

      delete activeTrades[tradeId];
      bot.deleteMessage(chatId, query.message.message_id).catch(() => {});

      return bot.sendMessage(chatId, `🎉 **VELIX OS | TRANSACTION PROTOCOL SEALED**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTrade verified and items successfully mutated across player accounts profiles. Execute \`/inventory\` to trace results.`);
    }

    // 6. TRANSACTION CORE CANCELLATION DETECTOR ROUTE
    if (data.startsWith("char_t_dec_")) {
      const tradeId = data.replace("char_t_dec_", "");
      const trade = activeTrades[tradeId];

      if (!trade) return;
      if (clickerId !== trade.receiver && clickerId !== trade.sender) return;

      delete activeTrades[tradeId];
      bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
      return bot.sendMessage(chatId, "❌ **Transaction Notice:** Escrow swap negotiation layer terminated by party operator.");
    }
  });
};
