// ==========================================
// 🎰 NICHIRIN FORGE GACHA SYSTEM (spin.js)
// ==========================================
const { getDB, saveDB, sanitizeUserObject } = require('./economy');

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

module.exports = (bot) => {
    
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
        } 
        else if (mode === "character") {
            currencyKey = "mythic";
            assetSymbol = "✨";
            if (count === 1) cost = 1500;
            else if (count === 5) cost = 7500;
        } 
        else if (mode === "material") {
            currencyKey = "crystals";
            assetSymbol = "💎";
            if (count === 1) cost = 50;
            else if (count === 5) cost = 250;
            else if (count === 10) { cost = 500; rolls = 11; } 
            else if (count === 50) cost = 2500;
        }

        let currentUserBalance = parseInt(p[currencyKey], 10) || 0;
        if (currentUserBalance < cost) {
            return bot.sendMessage(chatId, `❌ **Sack Depleted!** Need ${assetSymbol} \`${cost.toLocaleString()}\`.`);
        }

        let lootEarned = [];
        const normalNames = normalCards.map(c => c.name);

        for (let i = 0; i < rolls; i++) {
            if (mode === "normal") {
                if (Math.random() < 0.70) {
                    const randomNorm = normalNames[Math.floor(Math.random() * normalNames.length)];
                    p.inventory.push(randomNorm);
                    lootEarned.push(`🃏 Card: ${randomNorm}`);
                } else {
                    const bonusCoins = Math.floor(Math.random() * 80) + 20;
                    p.coins += bonusCoins;
                    lootEarned.push(`🪙 Bonus: +${bonusCoins} Coins`);
                }
            } 
            else if (mode === "character") {
                const randChance = Math.random() * 100;
                let droppedCharName = "";
                let droppedCharId = "";

                if (randChance < 3.0) { 
                    const muzan = mythicCards.find(c => c.id.includes("muzan"));
                    droppedCharName = muzan.name; droppedCharId = muzan.id.split('_')[0]; 
                    lootEarned.push(`🔥 [MYTHICAL] ${droppedCharName}`);
                } else if (randChance < 15.0) {
                    const luckyMythic = mythicCards[Math.floor(Math.random() * mythicCards.length)];
                    droppedCharName = luckyMythic.name; droppedCharId = luckyMythic.id.split('_')[0];
                    lootEarned.push(`✨ [LIMITED] ${droppedCharName}`);
                } else {
                    const normalFallback = normalNames[Math.floor(Math.random() * normalNames.length)];
                    droppedCharName = normalFallback; droppedCharId = normalFallback.toLowerCase().replace(/\s+/g, '');
                    lootEarned.push(`🃏 Card: ${droppedCharName}`);
                }

                let hasDuplicate = p.inventory.some(item => (typeof item === "string" ? item : item.name).toLowerCase() === droppedCharName.toLowerCase());

                if (hasDuplicate) {
                    const essenceKey = `${droppedCharId}_essence`;
                    p.materials[essenceKey] = (parseInt(p.materials[essenceKey], 10) || 0) + 1;
                    lootEarned[lootEarned.length - 1] += ` 🔄 (+1 ${essenceKey.toUpperCase()})`;
                } else {
                    p.inventory.push(droppedCharName);
                }
            } 
            else if (mode === "material") {
                if (Math.random() < 0.15) {
                    p.materials["universal_blessing"] = (parseInt(p.materials["universal_blessing"], 10) || 0) + 1;
                    lootEarned.push("💎 Universal Blessing Ore Piece");
                } else {
                    const poolSample = mythicCards.map(c => c.id.split('_')[0]);
                    const designatedChar = poolSample[Math.floor(Math.random() * poolSample.length)];
                    const generatedEssence = `${designatedChar}_essence`;
                    p.materials[generatedEssence] = (parseInt(p.materials[generatedEssence], 10) || 0) + 1;
                    lootEarned.push(`🧪 Essence: ${generatedEssence.toUpperCase()}`);
                }
            }
        }

        p[currencyKey] -= cost;
        db[userId] = sanitizeUserObject(p); 
        saveDB(db);

        const processingMsg = await bot.sendMessage(chatId, `🎰 **NICHIRIN FORGE SLOTS**\n🔄 Processing...`);
        const reportSummary = lootEarned.map(item => `• ${item}`).join('\n');

        await bot.editMessageText(
            `🎰 **FORGE DROP REPORT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n${reportSummary}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ Secure`, 
            { chat_id: chatId, message_id: processingMsg.message_id, parse_mode: "Markdown" }
        ).catch(() => {});
    }

    // 🎛️ BUTTON INTERCEPTOR (Only fires for spin buttons)
    bot.on("callback_query", async (query) => {
        const chatId = query.message.chat.id;
        const callerId = query.from.id.toString();
        const dataPayload = query.data;

        // SAFE BYPASS FOR BATTLE BUTTONS
        if (!dataPayload.startsWith("select_platform:") && !dataPayload.startsWith("btn_spin:") && !dataPayload.startsWith("spin_back_main:")) {
            return; 
        }

        const chunks = dataPayload.split(":");
        const originalOwnerId = chunks[chunks.length - 1];

        if (originalOwnerId && originalOwnerId !== callerId && !dataPayload.startsWith("spin_back_main")) {
            return bot.answerCallbackQuery(query.id, {
                text: "❌ This is not your personal dashboard!",
                show_alert: true
            });
        }

        if (dataPayload.startsWith("select_platform:")) {
            const targetPlatform = chunks[1];
            let title = targetPlatform.toUpperCase() + " SPIN BUNDLES";
            let keyboardRows = [
                [{ text: `🎰 1x`, callback_data: `btn_spin:${targetPlatform}:1:${callerId}` }],
                [{ text: "⬅️ Back", callback_data: `spin_back_main:${callerId}` }]
            ];

            await bot.editMessageText(`🎰 **${title}**`, {
                chat_id: chatId, message_id: query.message.message_id,
                reply_markup: JSON.stringify({ inline_keyboard: keyboardRows }), parse_mode: "Markdown"
            }).catch(() => {});
            return bot.answerCallbackQuery(query.id);
        }

        if (dataPayload.startsWith("btn_spin:")) {
            bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
            await executeSpinLogic(chatId, callerId, chunks[1], parseInt(chunks[2], 10) || 1);
            return bot.answerCallbackQuery(query.id);
        }
    });
};
