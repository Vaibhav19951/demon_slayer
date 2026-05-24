// ==========================================
// 🪙 AUTOMATED CORPS ECONOMY CORE SYSTEM (economy.js)
// ==========================================
const fs = require('fs');
const path = require('path');

// Global Database Path
const dbPath = path.join(__dirname, '..', 'data', 'players.json');

// Mock Assets Configuration Pools
const normalCards = [
    { name: "Mizunoto Recruit" }, { name: "Mizunoe Slayer" }, 
    { name: "Kanoto Swordsman" }, { name: "Kanoe Guardian" },
    { name: "Tsuchinoto Enforcer" }
];

const mythicCards = [
    { id: "tanjiro_mythic", name: "Kamado Tanjiro (Sun Breathing)" },
    { id: "nezuko_mythic", name: "Kamado Nezuko (Awakened Form)" },
    { id: "zenitsu_mythic", name: "Agatsuma Zenitsu (Godspeed)" },
    { id: "muzan_mythic", name: "Kibutsuji Muzan (Demon King)" }
];

// Helper Functions: Safe Read/Write Core Storage
function getDB() {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(path.dirname(dbPath), { recursive: true });
            fs.writeFileSync(dbPath, JSON.stringify({}), 'utf8');
        }
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data || '{}');
    } catch (e) {
        console.error("🚨 DB Read Error:", e);
        return {};
    }
}

function saveDB(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error("🚨 DB Write Error:", e);
    }
}

// Data Sanitization Shield (No NaN / Undefined variables allowed)
function sanitizeUserObject(user) {
    let u = user || {};
    
    // Fallback system to check for alternative naming conventions in players.json
    let currentCoins = u.coins !== undefined ? u.coins : 500;
    let currentCrystals = u.crystals !== undefined ? u.crystals : 0;
    let currentMythic = u.mythic !== undefined ? u.mythic : (u.tokens !== undefined ? u.tokens : 0);

    return {
        coins: Math.max(0, parseInt(currentCoins, 10) || 500),
        crystals: Math.max(0, parseInt(currentCrystals, 10) || 0),
        mythic: Math.max(0, parseInt(currentMythic, 10) || 0),
        inventory: Array.isArray(u.inventory) ? u.inventory : [],
        materials: u.materials && typeof u.materials === 'object' ? u.materials : {},
        lastWork: parseInt(u.lastWork, 10) || 0,
        lastTask: parseInt(u.lastTask, 10) || 0
    };
}

module.exports = (bot) => {

    // ==========================================
    // 🏦 1. /balance (STORAGE ACCOUNT INQUIRY)
    // ==========================================
    bot.onText(/\/balance/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        let db = getDB();
        db[userId] = sanitizeUserObject(db[userId]);
        const p = db[userId];

        const report = `💰 **SLAYER FINANCIAL REGISTRY**\n` +
                       `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                       `• 🪙 **Crow Coins:** \`${p.coins.toLocaleString()}\` \n` +
                       `• 💎 **Crystals:** \`${p.crystals.toLocaleString()}\` \n` +
                       `• ✨ **Mythic Tokens:** \`${p.mythic.toLocaleString()}\` \n\n` +
                       `💼 **Inventory Size:** \`${p.inventory.length}\` Cards loaded.\n` +
                       `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        bot.sendMessage(chatId, report, { parse_mode: "Markdown" });
    });

    // ==========================================
    // ⚒️ 2. /work (BASIC INCOME DRIVER)
    // ==========================================
    bot.onText(/\/work/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const now = Date.now();
        const cooldown = 5 * 60 * 1000;

        let db = getDB();
        db[userId] = sanitizeUserObject(db[userId]);
        let p = db[userId];

        if (now - p.lastWork < cooldown) {
            const remaining = Math.ceil((cooldown - (now - p.lastWork)) / 1000);
            return bot.sendMessage(chatId, `⏳ **Exhaustion Alert!** Slayers need rest. Wait \`${remaining}s\` before your next patrol.`);
        }

        const payout = Math.floor(Math.random() * 80) + 50;
        p.coins += payout;
        p.lastWork = now;

        db[userId] = p;
        saveDB(db);

        bot.sendMessage(chatId, `🦅 **Patrol Successful!** You secured the area perimeter and earned 🪙 \`${payout}\` Crow Coins.`);
    });

    // ==========================================
    // 📜 3. /task (DAILY CONTRACT AGENT)
    // ==========================================
    bot.onText(/\/task/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const now = Date.now();
        const cooldown = 20 * 60 * 60 * 1000;

        let db = getDB();
        db[userId] = sanitizeUserObject(db[userId]);
        let p = db[userId];

        if (now - p.lastTask < cooldown) {
            const remHrs = Math.ceil((cooldown - (now - p.lastTask)) / (1000 * 60 * 60));
            return bot.sendMessage(chatId, `📜 **Demon Crest Locked!** Next official rank orders arrive in \`${remHrs} hours\`.`);
        }

        const coinReward = 200;
        const crystalReward = 2;

        p.coins += coinReward;
        p.crystals += crystalReward;
        p.lastTask = now;

        db[userId] = p;
        saveDB(db);

        bot.sendMessage(chatId, `📜 **MISSION COMPLETION NOTICE**\n━━━━━━━━━━━━━━━━━━━━━\nRank mission achieved! Received:\n• 🪙 \`${coinReward}\` Coins\n• 💎 \`${crystalReward}\` Crystals\n━━━━━━━━━━━━━━━━━━━━━\nYour accounts are fully synchronized.`);
    });

    // ==========================================
    // 🔀 4. /convert (EXCHANGE RATE MANAGER)
    // ==========================================
    bot.onText(/\/convert\s*(\w*)\s*(\d*)/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        let db = getDB();
        db[userId] = sanitizeUserObject(db[userId]);
        let p = db[userId];

        const direction = match[1] ? match[1].toLowerCase() : "";
        const amount = parseInt(match[2], 10);

        if (!direction || !amount || amount <= 0) {
            return bot.sendMessage(chatId, `❌ **Syntax: \`/convert c2cr <amount>\`**\nRate: \`100 Coins\` -> \`1 Crystal\``);
        }

        if (direction === "c2cr") {
            const cost = amount * 100;
            if (p.coins < cost) {
                return bot.sendMessage(chatId, `❌ **Insufficent Funds!** Exchange requires 🪙 \`${cost}\` Coins for \`${amount}\` Crystals.`);
            }
            p.coins -= cost;
            p.crystals += amount;

            db[userId] = p;
            saveDB(db);

            bot.sendMessage(chatId, `✅ **Vault Transaction Certified!** Converted 🪙 \`${cost}\` Coins into 💎 \`${amount}\` Crystals.`);
        } else {
            bot.sendMessage(chatId, "❌ **Unknown Exchange Formula!** Valid operations: `c2cr` (Coins to Crystals).");
        }
    });

    // ==========================================
    // ⚔️ 4.5 /upgrade (CHARACTER LEVEL-UP ENGINE)
    // ==========================================
    bot.onText(/\/upgrade(?:\s+(.+))?/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        let db = getDB();
        db[userId] = sanitizeUserObject(db[userId]);
        let p = db[userId];

        const inputChar = match[1] ? match[1].trim().toLowerCase() : "";

        if (!inputChar) {
            return bot.sendMessage(chatId, 
                `⚔️ **NICHIRIN FORGE | UPGRADE STATION**\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `❌ **Syntax Error!** Please specify a valid character name.\n` +
                `👉 *Usage:* \`/upgrade tanjiro\` or \`/upgrade nezuko\`\n\n` +
                `ℹ️ Every level upgrade requires **5x Character Essence**.\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                { parse_mode: "Markdown" }
            );
        }

        let baseCharIndex = p.inventory.findIndex(item => {
            let name = typeof item === "string" ? item : (item.name || "");
            return name.toLowerCase().includes(inputChar);
        });

        if (baseCharIndex === -1) {
            return bot.sendMessage(chatId, `❌ **Slayer Alert!** You do not own this character in your primary squad grid yet. Extraction required via /spin first.`);
        }

        let rawCharacter = p.inventory[baseCharIndex];
        let charObject = { name: "", level: 1 };
        if (typeof rawCharacter === "string") {
            charObject.name = rawCharacter;
            charObject.level = 1;
        } else {
            charObject.name = rawCharacter.name || "Unknown Slayer";
            charObject.level = parseInt(rawCharacter.level, 10) || 1;
        }

        if (charObject.level >= 5) {
            return bot.sendMessage(chatId, `👑 **Max Horizon Reached!** \`${charObject.name}\` is already at **Level 5 (Max Apex Rank)**.`);
        }

        let matchedMythic = mythicCards.find(c => c.name.toLowerCase().includes(inputChar));
        let charId = matchedMythic ? matchedMythic.id.split('_')[0] : inputChar.replace(/\s+/g, '');
        let essenceKey = `${charId}_essence`;

        let currentEssenceCount = parseInt(p.materials[essenceKey], 10) || 0;
        const requiredEssence = 5;

        if (currentEssenceCount < requiredEssence) {
            return bot.sendMessage(chatId, 
                `🧪 **RESOURCES DEPLETED | UPGRADE FAILED**\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Insufficient core components for the ascension matrix:\n\n` +
                `• Character: \`${charObject.name}\` (Lv. ${charObject.level})\n` +
                `• Required: 🧪 \`${requiredEssence}\` ${essenceKey.toUpperCase()}\n` +
                `• Available: 🧪 \`${currentEssenceCount}\` ${essenceKey.toUpperCase()}\n\n` +
                `💡 *Tip:* Pull duplicates from **Mythic Spin** to automatically accumulate essence.\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                { parse_mode: "Markdown" }
            );
        }

        p.materials[essenceKey] = currentEssenceCount - requiredEssence;
        charObject.level += 1;
        p.inventory[baseCharIndex] = charObject;

        db[userId] = sanitizeUserObject(p);
        saveDB(db);

        let basePower = charObject.level * 150;
        let originalPower = (charObject.level - 1) * 150;

        bot.sendMessage(chatId, 
            `🔥 **BREATHING ASCENSION COMPLETED!**\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `The target soul matrix has successfully broken through its limits!\n\n` +
            `⚔️ **Character:** \`${charObject.name}\`\n` +
            `📈 **Rank Evolution:** Level \`${charObject.level - 1}\` ➔ **Level \`${charObject.level}\`**\n` +
            `🔱 **Combat Power:** \`${originalPower}\` ➔ \`${basePower} CP\`\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🧪 *Deducted 5x ${essenceKey.toUpperCase()} from storage bank material slots.*`,
            { parse_mode: "Markdown" }
        );
    });
    
    // ==========================================
    // 🏮 5. /spin (TWO-STEP BUTTON KEYBOARD SYSTEM)
    // ==========================================
    bot.onText(/\/spin(?:\s+(\w+))?(?:\s+(\d+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        let db = getDB();
        db[userId] = sanitizeUserObject(db[userId]);
        let p = db[userId];

        if (!match[1]) {
            const platformMenu = {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [
                            { text: "🪙 Normal Platform", callback_data: `select_platform:normal:${userId}` },
                            { text: "✨ Mythic Platform", callback_data: `select_platform:character:${userId}` }
                        ],
                        [
                            { text: "💎 Material Platform", callback_data: `select_platform:material:${userId}` }
                        ]
                    ]
                }),
                parse_mode: "Markdown"
            };

            return bot.sendMessage(chatId, 
                `🎰 **NICHIRIN FORGE | SELECTION PORTAL**\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Slayer, choose your extraction platform to unlock bundles:\n\n` +
                `🪙 **Coins:** \`${p.coins.toLocaleString()}\` | ✨ **Tokens/Mythic:** \`${p.mythic.toLocaleString()}\` | 💎 **Crystals:** \`${p.crystals.toLocaleString()}\`\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━`, 
                platformMenu
            );
        }

        await executeSpinLogic(chatId, userId, match[1].toLowerCase(), match[2] ? parseInt(match[2], 10) : 1);
    });

    // ==========================================
    // ⚡ CENTRAL PHYSICS SPIN EXECUTION ENGINE
    // ==========================================
    async function executeSpinLogic(chatId, userId, mode, count) {
        let db = getDB();
        db[userId] = sanitizeUserObject(db[userId]);
        let p = db[userId];

        let cost = 0;
        let rolls = count;
        let currencyKey = "mythic";
        let assetSymbol = "";

        if (mode === "normal") {
            currencyKey = "coins";
            assetSymbol = "🪙";
            if (count === 1) cost = 25;
            else if (count === 5) cost = 250;
            else if (count === 10) { cost = 500; rolls = 11; } 
            else if (count === 50) cost = 2500;
            else return bot.sendMessage(chatId, "❌ **Invalid Multi-Spin count!** Options: 1, 5, 10, 50.");
        } 
        else if (mode === "character") {
            currencyKey = "mythic";
            assetSymbol = "✨";
            if (count === 1) cost = 1500;
            else if (count === 5) cost = 7500;
            else return bot.sendMessage(chatId, "❌ **Character spin bundles are limited to 1x or 5x spins only!**");
        } 
        else if (mode === "material") {
            currencyKey = "crystals";
            assetSymbol = "💎";
            if (count === 1) cost = 50;
            else if (count === 5) cost = 250;
            else if (count === 10) { cost = 500; rolls = 11; } 
            else if (count === 50) cost = 2500;
            else return bot.sendMessage(chatId, "❌ **Invalid Material compilation parameters!** Options: 1, 5, 10, 50.");
        } else {
            return bot.sendMessage(chatId, "❌ **Unknown Tier selection!**");
        }

        let currentUserBalance = parseInt(p[currencyKey], 10);
        if (isNaN(currentUserBalance)) currentUserBalance = 0;

        if (currentUserBalance < cost) {
            return bot.sendMessage(chatId, `❌ **Sack Depleted!** Need ${assetSymbol} \`${cost.toLocaleString()}\`. Current Balance: ${assetSymbol} \`${currentUserBalance.toLocaleString()}\`.`);
        }

        let lootEarned = [];
        const normalNames = Array.isArray(normalCards) ? normalCards.map(c => c.name) : [];
        const mythicObjects = Array.isArray(mythicCards) ? mythicCards : [];

        for (let i = 0; i < rolls; i++) {
            if (mode === "normal") {
                if (Math.random() < 0.70) {
                    const randomNorm = normalNames[Math.floor(Math.random() * normalNames.length)] || "Corps Recruit";
                    p.inventory.push(randomNorm);
                    lootEarned.push(`🃏 Card: ${randomNorm}`);
                } else {
                    const bonusCoins = Math.floor(Math.random() * 80) + 20;
                    p.coins = (parseInt(p.coins, 10) || 0) + bonusCoins;
                    lootEarned.push(`🪙 Bonus: +${bonusCoins} Coins`);
                }
            } 
            else if (mode === "character") {
                const randChance = Math.random() * 100;
                let droppedCharName = "";
                let droppedCharId = "";

                if (randChance < 3.0 && mythicObjects.length > 0) { 
                    const muzan = mythicObjects.find(c => c.id.includes("muzan")) || mythicObjects[mythicObjects.length - 1];
                    droppedCharName = muzan.name;
                    droppedCharId = muzan.id.split('_')[0]; 
                    lootEarned.push(`🔥 [MYTHICAL] ${droppedCharName}`);
                } else if (randChance < 15.0 && mythicObjects.length > 0) {
                    const luckyMythic = mythicObjects[Math.floor(Math.random() * mythicObjects.length)];
                    droppedCharName = luckyMythic.name;
                    droppedCharId = luckyMythic.id.split('_')[0];
                    lootEarned.push(`✨ [LIMITED] ${droppedCharName}`);
                } else {
                    const normalFallback = normalNames[Math.floor(Math.random() * normalNames.length)] || "Elite Recruit";
                    droppedCharName = normalFallback;
                    droppedCharId = normalFallback.toLowerCase().replace(/\s+/g, '');
                    lootEarned.push(`🃏 Card: ${droppedCharName}`);
                }

                let hasDuplicate = p.inventory.some(item => {
                    if (typeof item === "string") return item.toLowerCase() === droppedCharName.toLowerCase();
                    return item.name && item.name.toLowerCase() === droppedCharName.toLowerCase();
                });

                if (hasDuplicate) {
                    const essenceKey = `${droppedCharId}_essence`;
                    let curEssence = parseInt(p.materials[essenceKey], 10) || 0;
                    p.materials[essenceKey] = curEssence + 1;
                    lootEarned[lootEarned.length - 1] += ` 🔄 (Duplicate -> Converted to +1 ${essenceKey.toUpperCase()})`;
                } else {
                    p.inventory.push(droppedCharName);
                }
            } 
            else if (mode === "material") {
                if (Math.random() < 0.15) {
                    let curBless = parseInt(p.materials["universal_blessing"], 10) || 0;
                    p.materials["universal_blessing"] = curBless + 1;
                    lootEarned.push("💎 Universal Blessing Ore Piece");
                } else {
                    const poolSample = mythicObjects.length > 0 ? mythicObjects.map(c => c.id.split('_')[0]) : ["tanjiro", "nezuko", "zenitsu"];
                    const designatedChar = poolSample[Math.floor(Math.random() * poolSample.length)];
                    const generatedEssence = `${designatedChar}_essence`;
                    
                    let curEss = parseInt(p.materials[generatedEssence], 10) || 0;
                    p.materials[generatedEssence] = curEss + 1;
                    lootEarned.push(`🧪 Essence: ${generatedEssence.toUpperCase()}`);
                }
            }
        }

        p[currencyKey] = (parseInt(p[currencyKey], 10) || 0) - cost;
        db[userId] = sanitizeUserObject(p); 
        saveDB(db);

        const processingMsg = await bot.sendMessage(chatId, `🎰 **NICHIRIN FORGE SLOTS | MODE: ${mode.toUpperCase()}**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔄 Processing templates...\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎟️ \`Deducted:\` ${assetSymbol} ${cost.toLocaleString()}`);

        const reportSummary = lootEarned.map(item => `• ${item}`).join('\n');
        let finalOutput = `🎰 **FORGE DROP REPORT | PROCESS COMPLETION**\n` +
                          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                          `🎁 **EXTRACTED REWARDS (${rolls}x Processing):**\n${reportSummary}\n` +
                          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                          `BANK STORAGE SAVED STATUS: ✅ SECURE\n` +
                          `• Coins: \`${p.coins.toLocaleString()}\` | Crystals: \`${p.crystals}\` | Tokens: \`${p.mythic}\``;

        await bot.editMessageText(finalOutput, {
            chat_id: chatId,
            message_id: processingMsg.message_id,
            parse_mode: "Markdown"
        }).catch(() => {});
    }

    // ==========================================
    // 🎛️ BUTTONS TEXT INTERCEPTOR INTERACTION
    // ==========================================
    bot.on("callback_query", async (query) => {
        const chatId = query.message.chat.id;
        const callerId = query.from.id.toString();
        const dataPayload = query.data;

        // 🔥 SHIELD TRIGGER: Agar button ka data spin system ka nahi hai, toh bina intercept kiye bypass karo!
        if (!dataPayload.startsWith("select_platform:") && !dataPayload.startsWith("btn_spin:") && !dataPayload.startsWith("spin_back_main:")) {
            return; 
        }

        const chunks = dataPayload.split(":");
        const originalOwnerId = chunks[chunks.length - 1];

        if (originalOwnerId && originalOwnerId !== callerId && !dataPayload.startsWith("spin_back_main")) {
            return bot.answerCallbackQuery(query.id, {
                text: "❌ This is not your personal dashboard! Run /spin to open your own menu.",
                show_alert: true
            });
        }

        if (dataPayload.startsWith("select_platform:")) {
            const targetPlatform = chunks[1];
            
            let title = "";
            let baseAsset = "";
            let rate1 = 0, rate5 = 0;

            if (targetPlatform === "normal") {
                title = "🪙 NORMAL SPIN BUNDLES"; baseAsset = "Coins"; rate1 = 25; rate5 = 250;
            } else if (targetPlatform === "character") {
                title = "✨ MYTHIC SPIN BUNDLES"; baseAsset = "Tokens"; rate1 = 1500; rate5 = 7500;
            } else if (targetPlatform === "material") {
                title = "💎 MATERIAL SPIN BUNDLES"; baseAsset = "Crystals"; rate1 = 50; rate5 = 250;
            }

            let keyboardRows = [];
            if (targetPlatform === "character") {
                keyboardRows.push([
                    { text: `🎰 1x Spin (${rate1} ${baseAsset})`, callback_data: `btn_spin:character:1:${callerId}` },
                    { text: `🔥 5x Spin (${rate5} ${baseAsset})`, callback_data: `btn_spin:character:5:${callerId}` }
                ]);
            } else {
                keyboardRows.push([
                    { text: `🎰 1x`, callback_data: `btn_spin:${targetPlatform}:1:${callerId}` },
                    { text: `🚀 5x`, callback_data: `btn_spin:${targetPlatform}:5:${callerId}` }
                ]);
                keyboardRows.push([
                    { text: `💥 10x (+1 Free Bonus!)`, callback_data: `btn_spin:${targetPlatform}:10:${callerId}` },
                    { text: `👑 50x Mega Box`, callback_data: `btn_spin:${targetPlatform}:50:${callerId}` }
                ]);
            }
            keyboardRows.push([{ text: "⬅️ Back to Main Menu", callback_data: `spin_back_main:${callerId}` }]);

            await bot.editMessageText(
                `🎰 **${title}**\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Select your desired bundle multiplier depth:\n` +
                `• *10x multi-spins add +1 Free Roll inside execution loop!*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━`, 
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    reply_markup: JSON.stringify({ inline_keyboard: keyboardRows }),
                    parse_mode: "Markdown"
                }
            ).catch(() => {});
            
            return bot.answerCallbackQuery(query.id);
        }

        if (dataPayload.startsWith("btn_spin:")) {
            const targetMode = chunks[1];
            const countVal = chunks[2];
            const runCount = parseInt(countVal, 10) || 1;
            
            bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
            await executeSpinLogic(chatId, callerId, targetMode, runCount);
            return bot.answerCallbackQuery(query.id);
        }

        if (dataPayload.startsWith("spin_back_main")) {
            bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
            bot.processUpdate({ message: { chat: { id: chatId }, from: { id: callerId }, text: "/spin" } });
            return bot.answerCallbackQuery(query.id);
        }
    });
};
