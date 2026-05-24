const path = require("path");
const demonData = require(path.join(process.cwd(), "asset", "demon.js"));
const activeBattles = new Map();

module.exports = (bot) => {
    bot.onText(/\/battle/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        if (activeBattles.has(userId)) return bot.sendMessage(chatId, "⚔️ Already in battle!");

        const demon = demonData[Math.floor(Math.random() * demonData.length)];
        const session = {
            playerHp: 500, playerMaxHp: 500, playerAtk: 40,
            demonName: demon.name, demonHp: demon.hp, demonMaxHp: demon.hp, demonAtk: demon.attack
        };

        activeBattles.set(userId, session);

        bot.sendPhoto(chatId, demon.image, {
            caption: `👹 **ENCOUNTER: ${demon.name}**\n❤️ HP: 500 | 🖤 Demon: ${demon.hp}`,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "⚔️ Attack", callback_data: `slay_attack:${userId}` }, { text: "🛡️ Defend", callback_data: `slay_defend:${userId}` }],
                    [{ text: "🏃 Flee", callback_data: `slay_flee:${userId}` }]
                ]
            }
        });
    });

    bot.on("callback_query", async (query) => {
        if (!query.data.startsWith("slay_")) return;
        const [action, targetUserId] = query.data.split(":");
        const session = activeBattles.get(query.from.id.toString());
        if (!session) return bot.answerCallbackQuery(query.id, { text: "⚠️ Battle expired." });

        if (action === "slay_attack") {
            session.demonHp -= (Math.floor(Math.random() * 20) + 40);
            if (session.demonHp <= 0) {
                activeBattles.delete(query.from.id.toString());
                return bot.editMessageCaption(`🏆 **VICTORY!** You defeated ${session.demonName}.`, { chat_id: query.message.chat.id, message_id: query.message.message_id });
            }
        } else if (action === "slay_defend") {
            session.playerHp = Math.min(500, session.playerHp + 20);
        } else if (action === "slay_flee") {
            activeBattles.delete(query.from.id.toString());
            return bot.deleteMessage(query.message.chat.id, query.message.message_id);
        }

        // Damage back from demon
        session.playerHp -= 15;
        
        await bot.editMessageCaption(
            `⚔️ **COMBAT**\n❤️ Player: ${session.playerHp}\n🖤 ${session.demonName}: ${session.demonHp}`,
            {
                chat_id: query.message.chat.id, message_id: query.message.message_id,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "⚔️ Attack", callback_data: `slay_attack:${query.from.id}` }, { text: "🛡️ Defend", callback_data: `slay_defend:${query.from.id}` }],
                        [{ text: "🏃 Flee", callback_data: `slay_flee:${query.from.id}` }]
                    ]
                }
            }
        ).catch(() => {});
        bot.answerCallbackQuery(query.id);
    });
};
