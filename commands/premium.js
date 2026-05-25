const premium = (bot) => {

    // 1. Premium Shop Command
    bot.onText(/\/premium/, (msg) => {
        const chatId = msg.chat.id;
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✨ Essence/Blessings', callback_data: 'shop_essence' }],
                    [
                        { text: '⚔️ Buy Yoriichi', callback_data: 'buy_yoriichi' },
                        { text: '👹 Buy Muzan', callback_data: 'buy_muzan' }
                    ],
                    [{ text: '🌙 Buy Kokushibo', callback_data: 'buy_kokushibo' }]
                ]
            }
        };
        bot.sendMessage(chatId, `💎 **GOD SLAYER PREMIUM STORE** 💎\n━━━━━━━━━━━━━━━━━━━━━\n\nChoose your card to proceed:`, { parse_mode: 'Markdown', ...opts });
    });

    // 2. Handle Button Clicks
    bot.on('callback_query', (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;

        if (data.startsWith('buy_')) {
            const charName = data.split('_')[1];
            bot.sendMessage(chatId, `🔥 *Selected:* ${charName.toUpperCase()}\n\n1. Scan the QR code.\n2. Send the screenshot and UTR here for verification.`, { parse_mode: 'Markdown' });
            bot.sendPhoto(chatId, 'https://image-link.edgeone.app/1779687803104-dh71y4.jpg');
        }
    });

    // 3. Handle Payment Screenshot (Proof)
    bot.on('photo', (msg) => {
        const chatId = msg.chat.id;
        const photoId = msg.photo[msg.photo.length - 1].file_id;
        const ADMIN_ID = '2086993762'; // Add your ID here

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Approve', callback_data: `approve_${chatId}` },
                        { text: '❌ Reject', callback_data: `reject_${chatId}` }
                    ]
                ]
            }
        };

        bot.sendPhoto(ADMIN_ID, photoId, {
            caption: `🚨 *New Payment Request*\nUser ID: ${chatId}\n\n*Action Required:*`,
            parse_mode: 'Markdown',
            ...opts
        });
        
        bot.sendMessage(chatId, "✅ Proof submitted! Admin will verify your payment shortly.");
    });
};

module.exports = premium;
