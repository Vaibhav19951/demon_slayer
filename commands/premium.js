const premium = (bot) => {
    const ADMIN_ID = '2086993762'; 

    // 1. Initial Menu: Triggered by /premium command
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

    // 2. Centralized Callback Query Router for Premium Actions
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;
        const messageId = query.message.message_id;

        try {
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
                return bot.answerCallbackQuery(query.id);
            }

            // Step 3: Show QR Code when a character selection button is clicked
            if (data.startsWith('buy_')) {
                const charName = data.split('_')[1].toUpperCase();
                
                await bot.sendMessage(chatId, `🔥 *Target Selected:* ${charName}\n\nGenerating secure routing gateway link...`, { parse_mode: 'Markdown' });
                
                // Directly uploads image to user layout view
                await bot.sendPhoto(chatId, 'https://image-link.edgeone.app/1779687803104-dh71y4.jpg', {
                    caption: "📸 **Scan this official QR payment gateway.**\n\nOnce completed, upload the clear payment receipt screenshot directly in this chat channel alongside its transaction UTR code to obtain validation approval.",
                    parse_mode: 'Markdown'
                });
                return bot.answerCallbackQuery(query.id);
            }

            // Step 4: Admin Approval Action Gate (Executes inside Owner DM)
            if (data.startsWith('approve_')) {
                const targetUserId = data.split('_')[1];
                
                // Construct notification transmission payload to the buyer
                await bot.sendMessage(targetUserId, "🎉 **Payment Authorized!**\n\nThe premium God-Tier operational asset profiles have successfully synchronized and added directly to your standard inventory ledger. Execute `/profile` or check your asset vault to review changes.", { parse_mode: 'Markdown' });
                
                // Update Owner UI representation so you know execution finished safely
                await bot.editMessageCaption(`✅ **Transaction Fully Approved**\nUser Identity Reference: \`${targetUserId}\``, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown'
                });
                return bot.answerCallbackQuery(query.id);
            }

            // Step 5: Admin Rejection Action Gate (Executes inside Owner DM)
            if (data.startsWith('reject_')) {
                const targetUserId = data.split('_')[1];

                await bot.sendMessage(targetUserId, "❌ **Transaction Authorization Denied**\n\nYour submitted proof framework could not be verified by management. If this is a mistake, drop a query to technical help support.", { parse_mode: 'Markdown' });
                
                await bot.editMessageCaption(`❌ **Transaction Marked Rejected**\nUser Identity Reference: \`${targetUserId}\``, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'Markdown'
                });
                return bot.answerCallbackQuery(query.id);
            }

        } catch (error) {
            console.error("Premium Callback processing engine dropped a frame:", error);
            bot.answerCallbackQuery(query.id).catch(() => {});
        }
    });

    // 3. User Document Photo Proof Interceptor
    bot.on('photo', async (msg) => {
        const chatId = msg.chat.id;
        
        // Prevent intercepting photos if the master account uploads proof assets
        if (chatId.toString() === ADMIN_ID.toString()) return;

        const photoId = msg.photo[msg.photo.length - 1].file_id;
        const userTag = msg.from.username ? `@${msg.from.username}` : `User: ${msg.from.first_name}`;

        try {
            await bot.sendPhoto(ADMIN_ID, photoId, {
                caption: `🚨 **Incoming Payment Verification Request**\n━━━━━━━━━━━━━━━━━━━━━\n👤 **Origin Account:** ${userTag}\n🆔 **Internal ID Reference:** \`${chatId}\`\n\nVerify documentation carefully before executing global balance ledger assignments.`,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Approve Asset Drop', callback_data: `approve_${chatId}` },
                            { text: '❌ Reject Transaction', callback_data: `reject_${chatId}` }
                        ]
                    ]
                }
            });

            await bot.sendMessage(chatId, "✅ **Verification Packet Dispatched!**\n\nYour layout screenshot proof material has been securely delivered straight to the admin console DM ledger for validation review. Please pause actions until execution is complete.", { parse_mode: 'Markdown' });
        } catch (err) {
            console.error("Owner DM Forwarding failure:", err);
        }
    });
};

module.exports = premium;
