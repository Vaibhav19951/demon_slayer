/**
 * VELIX OS V2.5 | NICHIRIN FORGE GACHA SYSTEM
 * Fully Integrated with Base Assets, Mythical Limited & God-Tier Registries
 * Concurrency Safe & Optimized Dynamic Drop Engines
 */

// 📦 All Central Asset Registries Linked Natively
const assetRegistry = require("../asset/assets");
const mythicalRegistry = require("../asset/mythical");
const godTierRegistry = require("../asset/godtier"); // Nayi God-Tier registry file ka path

// 🛠️ Base pool parsing from central database
const characterPool = assetRegistry.characterRawArray || Object.keys(assetRegistry.characters).map(key => {
    return {
        id: key,
        name: assetRegistry.characters[key].name,
        rarity: assetRegistry.characters[key].rarity || "Common",
        image: assetRegistry.characters[key].img,
        hp: assetRegistry.characters[key].hp,
        atk: assetRegistry.characters[key].atk,
        defense: assetRegistry.characters[key].defense,
        speed: assetRegistry.characters[key].speed,
        abilities: assetRegistry.characters[key].abilities
    };
});

// 🔮 Mythical Limited Pool Injection
const mythicalPool = mythicalRegistry.mythicalArray || mythicalRegistry.mythical || [];

// 👑 God-Tier Pool Injection
const godTierPool = godTierRegistry.godTierArray || Object.values(godTierRegistry.godTierManifest || {});

console.log(`🎰 [LOADED SUCCESS] Nichirin Forge Engine Linked: spin.js`);
console.log(`📦 Base Pool: ${characterPool.length} | ✨ Mythical Pool: ${mythicalPool.length} | 👑 God-Tier Pool: ${godTierPool.length}`);

module.exports = (bot) => {
    
    // Command: /spin - OPEN CHROME SELECTION PORTAL
    bot.onText(/\/spin(?:\s+(\w+))?(?:\s+(\d+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        const player = bot.getPlayerData(userId);
        if (!player) return;

        // Safety structure setup
        if (player.coins === undefined) player.coins = 0;
        if (player.mythic === undefined) player.mythic = 0;
        if (player.crystals === undefined) player.crystals = 0;

        if (!match[1]) {
            const platformMenu = {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [
                            { text: "🪙 Normal Platform", callback_data: `select_platform:normal:${userId}` },
                            { text: "✨ Mythical Platform", callback_data: `select_platform:character:${userId}` }
                        ],
                        [
                            { text: "💎 Material Platform", callback_data: `select_platform:material:${userId}` }
                        ]
                    ]
                }),
                parse_mode: "Markdown"
            };

            return bot.sendMessage(chatId, 
                `🎰 **VELIX OS | NICHIRIN FORGE SELECTION**\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Slayer, choose your extraction platform to unlock bundles:\n\n` +
                `• 🪙 **Coins:** \`${player.coins.toLocaleString()}\`\n` +
                `• ✨ **Mythic Tokens:** \`${player.mythic.toLocaleString()}\`\n` +
                `• 💎 **Crystals:** \`${player.crystals.toLocaleString()}\`\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━`, 
                platformMenu
            );
        }

        await executeSpinLogic(chatId, userId, match[1].toLowerCase(), match[2] ? parseInt(match[2], 10) : 1);
    });

    async function executeSpinLogic(chatId, userId, mode, count) {
        const player = bot.getPlayerData(userId);
        if (!player) return;

        // System Sync Fallbacks
        if (player.coins === undefined) player.coins = 0;
        if (player.mythic === undefined) player.mythic = 0;
        if (player.crystals === undefined) player.crystals = 0;
        if (!player.inventory) player.inventory = [];
        if (!player.materials) player.materials = {};

        let cost = 0;
        let rolls = count;
        let currencyKey = "mythic";
        let assetSymbol = "";

        if (mode === "normal") {
            currencyKey = "coins"; assetSymbol = "🪙";
            if (count === 1) cost = 25;
            else if (count === 5) cost = 250;
            else if (count === 10) { cost = 500; rolls = 11; } 
            else if (count === 50) cost = 2500;
            else return bot.sendMessage(chatId, "❌ **Invalid Bundle!** Options: 1, 5, 10, 50.");
        } 
        else if (mode === "character") {
            currencyKey = "mythic"; assetSymbol = "✨";
            if (count === 1) cost = 1500;
            else if (count === 5) cost = 7500;
            else return bot.sendMessage(chatId, "❌ **Mythical Bundles are limited to 1x or 5x spins only!**");
        } 
        else if (mode === "material") {
            currencyKey = "crystals"; assetSymbol = "💎";
            if (count === 1) cost = 50;
            else if (count === 5) cost = 250;
            else if (count === 10) { cost = 500; rolls = 11; } 
            else if (count === 50) cost = 2500;
            else return bot.sendMessage(chatId, "❌ **Invalid Bundle!** Options: 1, 5, 10, 50.");
        }

        let currentUserBalance = parseInt(player[currencyKey], 10) || 0;
        if (currentUserBalance < cost) {
            return bot.sendMessage(chatId, `❌ **Sack Depleted!** Need ${assetSymbol} \`${cost.toLocaleString()}\`.\nCurrent Balance: ${assetSymbol} \`${currentUserBalance.toLocaleString()}\``);
        }

        let lootEarned = [];

        // Sorting base pools
        const commonPool = characterPool.filter(c => c.rarity === "Common" || c.rarity === "Uncommon");
        const highPool = characterPool.filter(c => c.rarity === "SR" || c.rarity === "SSR" || c.rarity === "UR");

        for (let i = 0; i < rolls; i++) {
            if (mode === "normal") {
                const randRoll = Math.random() * 100;

                // 🪙 Coins platform:
                // 0.1% Micro-chance for God-Tier drop from coins
                if (randRoll < 0.1 && godTierPool.length > 0) {
                    const dropped = godTierPool[Math.floor(Math.random() * godTierPool.length)];
                    processGachaDrop(player, dropped, "God-Tier", lootEarned);
                }
                // 1% Hyper-rare chance to drop Mythical Limited cards
                else if (randRoll < 1.1 && mythicalPool.length > 0) {
                    const dropped = mythicalPool[Math.floor(Math.random() * mythicalPool.length)];
                    processGachaDrop(player, dropped, "Mythical Limited", lootEarned);
                }
                // 15% chance to drop SR/SSR/UR base cards
                else if (randRoll < 16.1 && highPool.length > 0) {
                    const dropped = highPool[Math.floor(Math.random() * highPool.length)];
                    processGachaDrop(player, dropped, dropped.rarity, lootEarned);
                }
                // 64% chance to drop Common/Uncommon cards
                else if (randRoll < 80.1 && commonPool.length > 0) {
                    const dropped = commonPool[Math.floor(Math.random() * commonPool.length)];
                    processGachaDrop(player, dropped, dropped.rarity, lootEarned);
                } 
                // Fallback to bonus raw coins
                else {
                    const bonusCoins = Math.floor(Math.random() * 80) + 20;
                    player.coins += bonusCoins;
                    lootEarned.push(`🪙 Bonus: +${bonusCoins} Coins`);
                }
            } 
            else if (mode === "character") {
                const randChance = Math.random() * 100;
                let dropped = null;

                // ✨ Mythical Premium Platform Rates:
                // 💥 3.5% Super Rare chance to hit a GOD-TIER character!
                if (randChance < 3.5 && godTierPool.length > 0) {
                    dropped = godTierPool[Math.floor(Math.random() * godTierPool.length)];
                    processGachaDrop(player, dropped, "God-Tier", lootEarned);
                } 
                // 👑 25% Chance to pull a Mythical Limited card
                else if (randChance < 28.5 && mythicalPool.length > 0) {
                    dropped = mythicalPool[Math.floor(Math.random() * mythicalPool.length)];
                    processGachaDrop(player, dropped, "Mythical Limited", lootEarned);
                } 
                // ✨ 35% Chance to pull standard elite tier (SR/SSR/UR)
                else if (randChance < 63.5 && highPool.length > 0) {
                    dropped = highPool[Math.floor(Math.random() * highPool.length)];
                    processGachaDrop(player, dropped, dropped.rarity, lootEarned);
                } 
                // Fallback to base cards
                else if (commonPool.length > 0) {
                    dropped = commonPool[Math.floor(Math.random() * commonPool.length)];
                    processGachaDrop(player, dropped, dropped.rarity, lootEarned);
                } else {
                    dropped = characterPool[Math.floor(Math.random() * characterPool.length)];
                    processGachaDrop(player, dropped, dropped.rarity, lootEarned);
                }
            } 
            else if (mode === "material") {
                // 💎 Material platform engine
                if (Math.random() < 0.15) {
                    player.materials["universal_blessing"] = (parseInt(player.materials["universal_blessing"], 10) || 0) + 1;
                    lootEarned.push("💎 Universal Blessing Ore Piece");
                } else {
                    // Random dynamic essence matching structure
                    const dropped = characterPool[Math.floor(Math.random() * characterPool.length)];
                    let tier = dropped.rarity.toLowerCase().replace(/\s+/g, '_');
                    let baseCleanName = dropped.name.toLowerCase().replace(/🔥|awakened|limited|\[.*?\]|\(.*?\)/g, '').trim().replace(/\s+/g, '_');
                    let randomEssenceKey = `${baseCleanName}_${tier}_essence`;

                    player.materials[randomEssenceKey] = (parseInt(player.materials[randomEssenceKey], 10) || 0) + 1;
                    lootEarned.push(`🧪 Essence Fragment: ${randomEssenceKey.toUpperCase()}`);
                }
            }
        }

        // Deduct balance and save state safely
        player[currencyKey] -= cost;
        bot.savePlayerData(userId, player);

        const processingMsg = await bot.sendMessage(chatId, `🎰 **VELIX OS FORGE | MODE: ${mode.toUpperCase()}**\n` + `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` + `🔄 Resonating Ancient Sun Breathing Runes...\n` + `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` + `🎟️ \`Deducted:\` ${assetSymbol} ${cost.toLocaleString()}`);
        const reportSummary = lootEarned.map(item => `• ${item}`).join('\n');

        await bot.editMessageText(
            `🎰 **FORGE DROP REPORT | PROCESS COMPLETION**\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🎁 **EXTRACTED REWARDS (${rolls}x Processing):**\n${reportSummary}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `⚖️ **Ledger Status:** Profile balances synchronized.\n` +
            `• Coins: \`${player.coins.toLocaleString()}\` | Crystals: \`${player.crystals}\` | Tokens: \`${player.mythic}\``, 
            { chat_id: chatId, message_id: processingMsg.message_id, parse_mode: "Markdown" }
        ).catch(() => {});
    }

    // Modularized function to avoid redundant injection and handle duplicate conversions smoothly
    function processGachaDrop(player, card, rarityName, lootEarned) {
        let cleanRarity = rarityName.toLowerCase().replace(/\s+/g, '_');
        let baseCleanName = card.name.toLowerCase().replace(/🔥|awakened|limited|\[.*?\]|\(.*?\)/g, '').trim().replace(/\s+/g, '_');
        
        let essenceKey = `${baseCleanName}_${cleanRarity}_essence`;
        let blessingKey = `${baseCleanName}_${cleanRarity}_blessing`;

        let hasDuplicate = player.inventory.some(item => (typeof item === "string" ? item : item.name).toLowerCase() === card.name.toLowerCase());

        if (hasDuplicate) {
            player.materials[essenceKey] = (parseInt(player.materials[essenceKey], 10) || 0) + 2;
            player.materials[blessingKey] = (parseInt(player.materials[blessingKey], 10) || 0) + 1;
            lootEarned.push(`🔄 Duplicate [${card.name}] Converted ➔ +2 ${rarityName.toUpperCase()} Essence, +1 Blessing`);
        } else {
            // Compute starting combat power metrics safely
            let calcPower = card.power || card.atk || 100;

            player.inventory.push({ 
                id: card.id,
                name: card.name, 
                rarity: rarityName, 
                level: card.level || 1, 
                exp: card.xp || 0, 
                max_xp: card.max_xp || 1000,
                power: calcPower,
                atk: card.atk || calcPower,
                image: card.image || card.img || "",
                type: card.type || "Physical",
                isAwakened: card.isAwakened || false,
                awakeningStage: card.awakeningStage || 0
            });
            
            // Premium Badges assigned inside reports dynamically
            let badge = "🃏";
            if (rarityName === "God-Tier") badge = "⚡ [GOD-TIER]";
            else if (rarityName === "Mythical Limited") badge = "👑 [MYTHICAL LIMITED]";
            else badge = `🎴 [${rarityName.toUpperCase()}]`;

            lootEarned.push(`${badge} ${card.name}`);
        }
    }

    // 🎛️ INLINE KEYBOARD CONTROLLER WITH BYPASS PROTECTION
    bot.on("callback_query", async (query) => {
        const chatId = query.message.chat.id;
        const callerId = query.from.id.toString();
        const dataPayload = query.data;

        if (!dataPayload.startsWith("select_platform:") && !dataPayload.startsWith("btn_spin:") && !dataPayload.startsWith("spin_back_main")) {
            return; 
        }

        const chunks = dataPayload.split(":");
        const originalOwnerId = chunks[chunks.length - 1];

        if (originalOwnerId && originalOwnerId !== callerId && !dataPayload.startsWith("spin_back_main")) {
            return bot.answerCallbackQuery(query.id, {
                text: "🏮 This forge interface panel belongs to another Slayer alliance!",
                show_alert: true
            });
        }

        if (dataPayload.startsWith("select_platform:")) {
            const targetPlatform = chunks[1];
            let title = ""; let baseAsset = ""; let rate1 = 0; let rate5 = 0;

            if (targetPlatform === "normal") {
                title = "🪙 NORMAL SPIN BUNDLES"; baseAsset = "Coins"; rate1 = 25; rate5 = 250;
            } else if (targetPlatform === "character") {
                title = "✨ MYTHICAL LIMITED SPIN BUNDLES"; baseAsset = "Tokens"; rate1 = 1500; rate5 = 7500;
            } else if (targetPlatform === "material") {
                title = "💎 MATERIAL SPIN BUNDLES"; baseAsset = "Crystals"; rate1 = 50; rate5 = 250;
            }

            let keyboardRows = [];
            if (targetPlatform === "character") {
                keyboardRows.push([
                    { text: `🎰 1x Spin (${rate1} ${baseAsset})`, callback_data: `btn_spin:character:1:${callerId}` },
                    { text: `⚡ 5x Spin (${rate5} ${baseAsset})`, callback_data: `btn_spin:character:5:${callerId}` }
                ]);
            } else {
                keyboardRows.push([
                    { text: `🎰 1x`, callback_data: `btn_spin:${targetPlatform}:1:${callerId}` },
                    { text: `🚀 5x`, callback_data: `btn_spin:${targetPlatform}:5:${callerId}` }
                ]);
                keyboardRows.push([
                    { text: `💥 10x (+1 Free!)`, callback_data: `btn_spin:${targetPlatform}:10:${callerId}` },
                    { text: `👑 50x Mega Box`, callback_data: `btn_spin:${targetPlatform}:50:${callerId}` }
                ]);
            }
            keyboardRows.push([{ text: "⬅️ Back to Main Menu", callback_data: `spin_back_main:${callerId}` }]);

            await bot.editMessageText(
                `🎰 **${title}**\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Select your desired bundle multiplier depth:\n` +
                `• *Mythical Platform features an amplified 25% chance to drop Mythical Units and a hyper-exclusive 3.5% chance to extract supreme GOD-TIER entities!*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━`, 
                {
                    chat_id: chatId, message_id: query.message.message_id,
                    reply_markup: JSON.stringify({ inline_keyboard: keyboardRows }), parse_mode: "Markdown"
                }
            ).catch(() => {});
            return bot.answerCallbackQuery(query.id);
        }

        if (dataPayload.startsWith("btn_spin:")) {
            bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
            await executeSpinLogic(chatId, callerId, chunks[1], parseInt(chunks[2], 10) || 1);
            return bot.answerCallbackQuery(query.id);
        }

        if (dataPayload.startsWith("spin_back_main")) {
            bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
            const fakeMsg = { chat: { id: chatId }, from: { id: callerId }, text: "/spin" };
            bot.emit("text", fakeMsg);
            return bot.answerCallbackQuery(query.id);
        }
    });
};
