console.log("💰 ECONOMY ENGINE v2.5 [FULL INTEGRATION]");

const fs = require("fs");
const path = require("path");
const playerFile = path.join(process.cwd(), "data", "players.json");

const getDB = () => {
    try {
        if (!fs.existsSync(playerFile)) return {};
        return JSON.parse(fs.readFileSync(playerFile, "utf8"));
    } catch (e) { return {}; }
};

const saveDB = (data) => {
    try {
        const tempPath = playerFile + ".tmp";
        fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
        fs.renameSync(tempPath, playerFile);
    } catch (e) { console.error("🔥 Economy Write Error:", e); }
};

module.exports = (bot) => {

    const ensureUser = (userId) => {
        let db = getDB();
        if (!db[userId]) {
            db[userId] = { 
                coins: 500, crystals: 0, mythic: 0, exp: 0, level: 1, 
                last_daily: "", active_task: null 
            };
            saveDB(db);
        }
        return db;
    };

    const assignTask = (user) => {
        const pool = [
            { id: "hunt", desc: "Hunt 5 demons", target: 5 },
            { id: "battle", desc: "Play 10 battles", target: 10 },
            { id: "work", desc: "Work 5 times", target: 5 }
        ];
        const t = pool[Math.floor(Math.random() * pool.length)];
        user.active_task = { ...t, progress: 0, completed: false };
    };

    // 1. BALANCE & PROFILE
    bot.onText(/\/(?:balance|bal)/, (msg) => {
        const userId = msg.from.id.toString();
        let db = ensureUser(userId);
        let p = db[userId];
        const text = `💠 **VELIX OS | PROFILE** 💠\n━━━━━━━━━━━━━━━━━━━━\n💰 **Coins:** \`${Number(p.coins).toLocaleString()}\`\n💎 **Crystals:** \`${Number(p.crystals).toLocaleString()}\`\n✨ **Mythic Tokens:** \`${Number(p.mythic).toLocaleString()}\`\n📊 **Level:** ${p.level} (XP: ${p.exp})\n━━━━━━━━━━━━━━━━━━━━`;
        bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
    });

    // 2. TASK SYSTEM
    bot.onText(/\/task/, (msg) => {
        const userId = msg.from.id.toString();
        let db = ensureUser(userId);
        let p = db[userId];
        const today = new Date().toISOString().split('T')[0];

        if (!p.active_task || p.last_daily !== today) {
            assignTask(p);
            p.last_daily = today;
            saveDB(db);
        }

        const t = p.active_task;
        const status = t.completed ? "✅ COMPLETED" : "⏳ PENDING";
        const text = `📋 **DAILY MISSION**\n\nTask: ${t.desc}\nStatus: ${status}\nProgress: [${t.progress}/${t.target}]\n\nReward: 20 Mythic + 50 XP`;
        bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
    });

    // 3. CONVERTER
    bot.onText(/\/convert (.+) (.+)/, (msg, match) => {
        const userId = msg.from.id.toString();
        let db = ensureUser(userId);
        const type = match[1].toLowerCase();
        const amount = Number(match[2]);

        if (type === "c2cr") { // 1M Coins = 10k Crystals
            const cost = amount * 100;
            if (db[userId].coins < cost) return bot.sendMessage(msg.chat.id, "❌ Not enough coins.");
            db[userId].coins -= cost;
            db[userId].crystals += amount;
            bot.sendMessage(msg.chat.id, `🔄 Converted ${cost} Coins to ${amount} Crystals!`);
        } else if (type === "cr2mt") { // 10k Crystals = 100 Tokens
            const cost = amount * 100;
            if (db[userId].crystals < cost) return bot.sendMessage(msg.chat.id, "❌ Not enough crystals.");
            db[userId].crystals -= cost;
            db[userId].mythic += amount;
            bot.sendMessage(msg.chat.id, `🔄 Converted ${cost} Crystals to ${amount} Mythic Tokens!`);
        }
        saveDB(db);
    });

    // 4. SPIN (LUCKY DRAW)
    bot.onText(/\/spin/, (msg) => {
        const userId = msg.from.id.toString();
        let db = ensureUser(userId);
        if (db[userId].coins >= 1200) db[userId].coins -= 1200;
        else if (db[userId].mythic >= 5) db[userId].mythic -= 5;
        else return bot.sendMessage(msg.chat.id, "❌ Need 1200 Coins or 5 Mythic Tokens.");

        const roll = Math.random() * 100;
        const prize = roll < 70 ? "Basic Weapon 🗡️" : roll < 90 ? "Common Card 🃏" : "Rare Card 🌟";
        
        saveDB(db);
        bot.sendMessage(msg.chat.id, `🎡 **LUCKY SPIN**\nResult: You won ${prize}`);
    });

    // 5. WORK (WITH TASK INTEGRATION)
    bot.onText(/\/work/, (msg) => {
        const userId = msg.from.id.toString();
        let db = ensureUser(userId);
        let p = db[userId];
        
        const earnings = 200;
        p.coins += earnings;
        
        // Task Update Logic
        if (p.active_task && p.active_task.id === "work" && !p.active_task.completed) {
            p.active_task.progress += 1;
            if (p.active_task.progress >= p.active_task.target) {
                p.active_task.completed = true;
                p.mythic += 20; p.exp += 50;
                bot.sendMessage(msg.chat.id, "🎉 Task Completed! +20 Mythic Tokens & +50 XP!");
            }
        }
        
        saveDB(db);
        bot.sendMessage(msg.chat.id, `💼 Worked! Earned ${earnings} coins.`);
    });
};
