// ==========================================
// 🪙 AUTOMATED CORPS ECONOMY CORE SYSTEM
// ==========================================
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'players.json');

function getDB() {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(path.dirname(dbPath), { recursive: true });
            fs.writeFileSync(dbPath, JSON.stringify({}), 'utf8');
        }
        return JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}');
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

function sanitizeUserObject(user) {
    let u = user || {};
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
    // 🏦 /balance
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

    // ⚒️ /work
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

    // 📜 /task
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

    // 🔀 /convert
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
};

// Export karke helper functions doosri files ko de dete hain
module.exports.getDB = getDB;
module.exports.saveDB = saveDB;
module.exports.sanitizeUserObject = sanitizeUserObject;
