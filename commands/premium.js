const premium = (bot) => {
    const ADMIN_ID = '2086993762'; 

    // 1. Initial Menu: Only 2 main buttons
    bot.onText(/\/premium/, (msg) => {
        const chatId = msg.chat.id;
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✨ Essence & Blessings', callback_data: 'shop_essence' },
                        { text: '👑 God-Tier Cards', callback_data: 'view_godtier' }
                    ]
                ]
            }
        };
        bot.sendMessage(chatId, "💎 **GOD SLAYER PREMIUM STORE** 💎\n\nChoose a category to proceed:", { parse_mode: 'Markdown', ...opts });
    });

    // 2. Handle Category Selection
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;

        // Step 2: Show God-Tier Details + Buy Buttons
        if (data === 'view_godtier') {
            const godTierMenu = `
👑 **GOD-TIER LEGENDARY CARDS** 👑
━━━━━━━━━━━━━━━━━━━━━
⚔️ **Yoriichi Tsugikuni**
Power: 5000 | Price: ₹499

👹 **Muzan Kibutsuji**
Power: 4500 | Price: ₹399

🌙 **Kokushibo**
Power: 4000 | Price: ₹199`;

            await bot.sendMessage(chatId, godTierMenu, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '⚔️ Buy Yoriichi', callback_data: 'buy_yoriichi' },
                            { text: '👹 Buy Muzan', callback_data: 'buy_muzan' },
                            { text: '🌙 Buy Kokushibo', callback_data: 'buy_kokushibo' }
                        ]
                    ]
                }
            });
            bot.answerCallbackQuery(query.id);
        }

        // Step 3: Show QR Code when a character is selected
        if (data.startsWith('buy_')) {
            const charName = data.split('_')[1];
            await bot.sendMessage(chatId, `You selected ${charName.toUpperCase()}.`);
            
            // Send QR Code
            await bot.sendPhoto(chatId, 'https://image-link.edgeone.app/1779687803104-dh71y4.jpg', {
                caption: "📸 **Scan this QR to pay.**\nAfter payment, send the screenshot and UTR number here."
            });
            bot.answerCallbackQuery(query.id);
        }

        // Admin Approval Logic
        if (data.startsWith('approve_')) {
            const userId = data.split('_')[1];
            bot.sendMessage(userId, "🎉 Congratulations! Your payment is approved and the card is added to your profile.");
            bot.sendMessage(chatId, "✅ User Approved.");
            bot.answerCallbackQuery(query.id);
        }
    });

    // 3. Receive Payment Proof
    bot.on('photo', (msg) => {
        const chatId = msg.chat.id;
        const photoId = msg.photo[msg.photo.length - 1].file_id;

        bot.sendPhoto(ADMIN_ID, photoId, {
            caption: `🚨 *New Payment Request*\nUser ID: ${chatId}`,
            reply_markup: {
                inline_keyboard: [[
                    { text: '✅ Approve', callback_data: `approve_${chatId}` },
                    { text: '❌ Reject', callback_data: `reject_${chatId}` }
                ]]
            }
        });
        bot.sendMessage(chatId, "✅ Proof submitted! Admin will verify your payment shortly.");
    });
};

module.exports = premium;
