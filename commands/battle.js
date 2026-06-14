/**
 * VELIX OS V2.5 - DEMON SLAYER HIGH-PERFORMANCE BATTLE SYSTEM
 * Optimized for High Concurrency (2000+ Active Users)
 * Synchronized with Core Global Ledger System
 *
 * 🔧 FIXED (by Claude): player.exp -> player.xp
 *    Reason: core/index.js stores experience in the "xp" field and
 *    deletes any "exp" field on load. Writing to "exp" here caused
 *    battle XP to be silently wiped on the next bot restart/reload.
 */

const demons = require("../asset/demons");

console.log("🦅 [LOADED SUCCESS] Battle Node Linked: battle.js");

// Active sessions track cache (Memory leak guarded)
const activeBattles = new Map();

module.exports = (bot) => {

    // ========================================
    // ⚔️ /battle - ENGAGE THE DEMON THREAT
    // ========================================
    bot.onText(/\/battle/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        // 🛑 User state synchronization guard
        if (activeBattles.has(userId)) {
            return bot.sendMessage(
                chatId, 
                "⚠️ **BATTLE LOCK ACTIVE!**\n━━━━━━━━━━━━━━━━━━━━━\nYou are already fighting a demon in another quadrant! Finish your active combat mission first.",
                { parse_mode: "Markdown" }
            );
        }

        // Fetch user data for personalized dynamic stats
        const player = bot.getPlayerData(userId);
        if (!player) return;

        // Pick a dynamic target from assets ledger safely
        const targetDemon = demons[Math.floor(Math.random() * demons.length)];
        if (!targetDemon) {
            return bot.sendMessage(chatId, "❌ **Intel Error:** Could not locate any active demon signatures.");
        }

        const demon = JSON.parse(JSON.stringify(targetDemon));

        // Reward Calculation Matrices
        let reward = 100;
        let exp = 50;

        if (Array.isArray(demon.reward)) {
            reward = Math.floor(Math.random() * (demon.reward[1] - demon.reward[0] + 1)) + demon.reward[0];
        }
        if (Array.isArray(demon.exp)) {
            exp = Math.floor(Math.random() * (demon.exp[1] - demon.exp[0] + 1)) + demon.exp[0];
        }

        // Setup dynamic player scale based on their core system level
        const playerLevel = player.level || 1;
        const playerHp = 200 + (playerLevel * 50); 
        const playerAtk = 30 + (playerLevel * 10);

        // Instantiate isolated operational sector session cache
        const session = {
            playerHp: playerHp,
            playerMaxHp: playerHp,
            playerAtk: playerAtk,
            demon,
            reward,
            exp
        };

        activeBattles.set(userId, session);

        // Render Combat Field Interface
        try {
            const combatLayout = 
                `👹 **DEMON ENCOUNTER DETECTED**\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `🎯 **Target:** *${demon.name}*\n` +
                `🏮 **Rank Status:** \`${demon.rank || "Unknown"}\`\n` +
                `🧬 **Blood Technique:** \`${demon.type || "Physical"}\`\n\n` +
                `🩸 **Demon Vitality:** \`[ ${demon.hp} HP ]\`\n` +
                `⚔️ **Demon Lethality:** \`${demon.attack} ATK\`\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `👤 **Slayer Profile:** TIER ${playerLevel}\n` +
                `💚 **Your Vitality:** \`[ ${session.playerHp} / ${session.playerMaxHp} HP ]\`\n` +
                `⚔️ **Breathing Modifier:** \`${session.playerAtk} ATK\`\n\n` +
                `⚡ *The stance is set. Unsheathe your Nichirin sword!*`;

            await bot.sendPhoto(chatId, demon.image, {
                caption: combatLayout,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "⚔️ Form Strike", callback_data: `battle_attack_${userId}` },
                            { text: "🏃 Tactical Retreat", callback_data: `battle_run_${userId}` }
                        ]
                    ]
                }
            });

        } catch (err) {
            console.error("❌ Combat layout dispatch failed:", err.message);
            activeBattles.delete(userId);
            bot.sendMessage(chatId, "❌ **System Error:** Battle arena matrix initiation failed.");
        }
    });

    // ========================================
    // 🎮 COMBAT ACTION CORTEGE ROUTER
    // ========================================
    bot.on("callback_query", async (query) => {
        const data = query.data;

        // 🛡️ Filter parameters guard logic
        if (!data.startsWith("battle_attack_") && !data.startsWith("battle_run_")) return;

        try {
            const chatId = query.message.chat.id;
            const userId = query.from.id.toString();
            const messageId = query.message.message_id;
            const targetId = data.split("_")[2];

            // Anti-Steal Guard
            if (targetId !== userId) {
                return bot.answerCallbackQuery(query.id, {
                    text: "🏮 This battlefield belongs to another Slayer alliance!",
                    show_alert: true
                });
            }

            const session = activeBattles.get(userId);
            if (!session) {
                return bot.answerCallbackQuery(query.id, {
                    text: "⏳ The battle has turned cold. Combat session expired!",
                    show_alert: true
                });
            }

            const demon = session.demon;

            // ----------------------------------------
            // ACTION: TACTICAL RETREAT (RUN)
            // ----------------------------------------
            if (data.startsWith("battle_run_")) {
                activeBattles.delete(userId);
                
                const escapeLayout = 
                    `🏃 **TACTICAL ESCAPE ROUTE EXECUTED**\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `You dropped a flash bomb and scattered into the shadow mist, escaping from *${demon.name}*.\n\n` +
                    `⚠️ *Your rank ledger remains unchanged, but morale wavers.*`;

                await bot.editMessageCaption(escapeLayout, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: "Markdown"
                });
                return bot.answerCallbackQuery(query.id);
            }

            // ----------------------------------------
            // ACTION: FORM STRIKE (ATTACK ROUND)
            // ----------------------------------------
            let playerDamage = Math.floor(Math.random() * 25) + session.playerAtk;
            demon.hp -= playerDamage;

            let logReport = `⚔️ **Breathing Form dealt:** \`${playerDamage}\` DMG!\n`;

            // Case A: Demon Terminated (VICTORY)
            if (demon.hp <= 0) {
                activeBattles.delete(userId);

                // Load central player registry profile to commit loots
                const player = bot.getPlayerData(userId);
                if (player) {
                    player.coins += session.reward;

                    // 🔧 FIXED: use "xp" (matches core/index.js), not "exp"
                    if (player.xp === undefined) player.xp = 0;
                    player.xp += session.exp;

                    // Dynamic level ups verification logic
                    const currentLevel = player.level || 1;
                    const expRequirement = currentLevel * 250;
                    if (player.xp >= expRequirement) {
                        player.level = currentLevel + 1;
                        player.xp -= expRequirement;
                        logReport += `🔥 **RANK AWAKENING!** You advanced to Level TIER \`${player.level}\`!\n`;
                    }

                    // Save safely back to file database sync
                    bot.savePlayerData(userId, player);
                }

                const victoryLayout = 
                    `🏆 **VICTORY ASSURED | CORPS DECREE**\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `Splendid execution! You decapitated *${demon.name}* with precision.\n\n` +
                    `🎁 **Headquarters Loot Dispatch:**\n` +
                    `• 🪙 **Crow Coins:** \`+${session.reward}\`\n` +
                    `• ⭐ **Experience Points:** \`+${session.exp} EXP\`\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `✅ *Profile ledgers synchronized successfully.*`;

                await bot.editMessageCaption(victoryLayout, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: "Markdown"
                });
                return bot.answerCallbackQuery(query.id);
            }

            // Case B: Demon Counter-Strikes back
            let demonDamage = Math.floor(Math.random() * 12) + demon.attack;
            session.playerHp -= demonDamage;
            logReport += `👹 **${demon.name} countered:** \`${demonDamage}\` DMG!\n`;

            // Case C: Slayer Terminated (DEFEAT)
            if (session.playerHp <= 0) {
                activeBattles.delete(userId);

                const defeatLayout = 
                    `💀 **SLAYER FALLEN IN COMBAT**\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `You were overwhelmed by *${demon.name}*'s raw blood potency and knocked unconscious.\n\n` +
                    `🚑 *The medical corps extracted you back to Butterfly Mansion to heal.*`;

                await bot.editMessageCaption(defeatLayout, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: "Markdown"
                });
                return bot.answerCallbackQuery(query.id);
            }

            // Case D: Round finished, Cycle UI Update
            const roundLayout = 
                `👹 **ACTIVE COMBAT ARENA**\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `${logReport}\n` +
                `🩸 **Demon Vitality:** \`[ ${Math.max(0, demon.hp)} HP ]\`\n` +
                `💚 **Your Vitality:** \`[ ${session.playerHp} / ${session.playerMaxHp} HP ]\`\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `⚡ *Recalibrate your breathing strategy! Choose the next step:*`;

            await bot.editMessageCaption(roundLayout, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "⚔️ Attack Continuous", callback_data: `battle_attack_${userId}` },
                            { text: "🏃 Run Away", callback_data: `battle_run_${userId}` }
                        ]
                    ]
                }
            });

            return bot.answerCallbackQuery(query.id);

        } catch (err) {
            console.error("❌ Critical query action failure inside Arena:", err);
            return bot.answerCallbackQuery(query.id, {
                text: "❌ Internal Processing Core Error.",
                show_alert: true
            });
        }
    });
};
