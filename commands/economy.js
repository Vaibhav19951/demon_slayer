const fs = require("fs");
const path = require("path");
const playerFile = path.join(__dirname, "../data/players.json");

// Centralized DB Helper
const getDB = () => {
    try {
        if (!fs.existsSync(playerFile)) return {};
        return JSON.parse(fs.readFileSync(playerFile, "utf8"));
    } catch (e) { return {}; }
};

const saveDB = (data) => {
    fs.writeFileSync(playerFile, JSON.stringify(data, null, 2));
};

module.exports = (bot) => {

    // 1. BALANCE COMMAND
    bot.onText(/\/balance/, (msg) => {
        const userId = msg.from.id.toString();
        const db = getDB();
        const p = db[userId];

        if (!p) return bot.sendMessage(msg.chat.id, "❌ Please use /start to register first!");
        
        const text = `⚔️ *Slayer Inventory* ⚔️\n\n👛 *Wallet:* ${p.coins || 0} coins\n🏦 *Bank:* ${p.tokens || 0} tokens`;
        bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
    });

    // 2. WORK COMMAND
    bot.onText(/\/work/, (msg) => {
        const userId = msg.from.id.toString();
        let db = getDB();
        
        if (!db[userId]) return bot.sendMessage(msg.chat.id, "❌ Register with /start first!");

        const earnings = Math.floor(Math.random() * 150) + 50;
        db[userId].coins = (db[userId].coins || 0) + earnings;
        
        saveDB(db); // Data save karna zaroori hai!
        
        bot.sendMessage(msg.chat.id, `💼 You worked and earned *${earnings} coins*!`);
    });

    // 3. DEPOSIT COMMAND
    bot.onText(/\/deposit(?: (.+))?/, (msg, match) => {
        const userId = msg.from.id.toString();
        let db = getDB();
        let p = db[userId];
        
        if (!p) return bot.sendMessage(msg.chat.id, "❌ Register with /start first!");

        let amount = match[1] === "all" ? p.coins : Number(match[1]);

        if (isNaN(amount) || amount <= 0 || amount > p.coins) {
            return bot.sendMessage(msg.chat.id, "❌ Invalid amount!");
        }

        p.coins -= amount;
        p.tokens = (p.tokens || 0) + amount;
        
        saveDB(db); // Save to file
        bot.sendMessage(msg.chat.id, `🏦 Deposited ${amount} coins to bank!`);
    });

};
