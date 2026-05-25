/**
 * VELIX OS V2.8 | PREMIUM PAYMENT SYSTEM
 * QR + TIMER + SKIP TIMER + APPROVE/DENY
 */

const fs = require('fs');
const path = require('path');

const godTierRegistry = require("../asset/godchar");
const godCharManifest = godTierRegistry.godTierManifest || {};

console.log("💎 PREMIUM SYSTEM LOADED");

module.exports = (bot) => {

  const ADMIN_ID = '2086993762';

  // ==========================================
  // ⏳ ACTIVE TIMERS
  // ==========================================
  const activeTimers = {};

  // ==========================================
  // 💳 PRICE DATABASE
  // ==========================================
  const premiumPriceChart = {

    yoriichi_godtier: {
      name: "Yoriichi Tsugikuni (Card)",
      price: "₹499",
      type: "card"
    },

    muzan_godtier: {
      name: "Muzan Kibutsuji (Card)",
      price: "₹399",
      type: "card"
    },

    kokushibo_godtier: {
      name: "Kokushibo (Card)",
      price: "₹199",
      type: "card"
    },

    yoriichi_essence_pack: {
      name: "Yoriichi Essence x50 + Blessing x5",
      price: "₹249",
      type: "material",
      target: "yoriichi_godtier"
    },

    muzan_essence_pack: {
      name: "Muzan Essence x50 + Blessing x5",
      price: "₹199",
      type: "material",
      target: "muzan_godtier"
    },

    kokushibo_essence_pack: {
      name: "Kokushibo Essence x50 + Blessing x5",
      price: "₹149",
      type: "material",
      target: "kokushibo_godtier"
    },

    universal_awakening_stone: {
      name: "Universal Awakening Stone x1",
      price: "₹99",
      type: "universal"
    }

  };

  const LOCAL_QR_PATH =
    path.join(process.cwd(), 'asset', 'qr.jpg');

  // ==========================================
  // 👑 /premium
  // ==========================================
  bot.onText(/\/premium/, async (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    bot.getPlayerData(userId);

    await bot.sendMessage(

      chatId,

      `👑 *VELIX PREMIUM NETWORK*\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `Choose a category below.`,

      {
        parse_mode: 'Markdown',

        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✨ Essence & Materials',
                callback_data: 'prem_shop_essence'
              },
              {
                text: '👑 God Cards',
                callback_data: 'prem_view_godtier'
              }
            ]
          ]
        }
      }

    );

  });

  // ==========================================
  // 🎮 CALLBACKS
  // ==========================================
  bot.on('callback_query', async (query) => {

    const chatId = query.message.chat.id;
    const clickerId = query.from.id.toString();
    const data = query.data;
    const messageId = query.message.message_id;

    if (
      !data.startsWith('prem_') &&
      !data.startsWith('prempaid_') &&
      !data.startsWith('skip_')
    ) return;

    try {

      // ==========================================
      // 👑 VIEW GOD CARDS
      // ==========================================
      if (data === 'prem_view_godtier') {

        await bot.answerCallbackQuery(query.id);

        let text =
          `👑 *GOD CARD SHOP*\n` +
          `━━━━━━━━━━━━━━━━━━━\n\n`;

        Object.keys(godCharManifest).forEach((key) => {

          const char = godCharManifest[key];

          if (!char) return;

          if (
            char.id === "godTierArray" ||
            char.id === "godTierManifest"
          ) return;

          const price =
            premiumPriceChart[key]
              ? premiumPriceChart[key].price
              : "₹499";

          text +=
            `⚡ *${char.name}*\n` +
            `💥 Power: \`${char.power || char.atk || 4000}\`\n` +
            `💳 Price: \`${price}\`\n\n`;

        });

        return bot.sendMessage(
          chatId,
          text,
          {
            parse_mode: 'Markdown',

            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '⚔️ Buy Yoriichi',
                    callback_data: 'prem_buy_yoriichi_godtier'
                  },
                  {
                    text: '👹 Buy Muzan',
                    callback_data: 'prem_buy_muzan_godtier'
                  }
                ],
                [
                  {
                    text: '🌙 Buy Kokushibo',
                    callback_data: 'prem_buy_kokushibo_godtier'
                  }
                ]
              ]
            }
          }
        );

      }

      // ==========================================
      // ✨ MATERIAL SHOP
      // ==========================================
      if (data === 'prem_shop_essence') {

        await bot.answerCallbackQuery(query.id);

        return bot.sendMessage(

          chatId,

          `✨ *MATERIAL SHOP*\n` +
          `━━━━━━━━━━━━━━━━━━━\n\n` +

          `🧬 Yoriichi Pack ➜ ₹249\n` +
          `🧪 Muzan Pack ➜ ₹199\n` +
          `🌙 Kokushibo Pack ➜ ₹149\n` +
          `💎 Awakening Stone ➜ ₹99`,

          {
            parse_mode: 'Markdown',

            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🧬 Yoriichi Pack',
                    callback_data: 'prem_buy_yoriichi_essence_pack'
                  },
                  {
                    text: '🧪 Muzan Pack',
                    callback_data: 'prem_buy_muzan_essence_pack'
                  }
                ],
                [
                  {
                    text: '🌙 Kokushibo Pack',
                    callback_data: 'prem_buy_kokushibo_essence_pack'
                  },
                  {
                    text: '💎 Awakening Stone',
                    callback_data: 'prem_buy_universal_awakening_stone'
                  }
                ]
              ]
            }
          }

        );

      }

      // ==========================================
      // 💳 BUY ITEM
      // ==========================================
      if (data.startsWith('prem_buy_')) {

        await bot.answerCallbackQuery(query.id);

        const selectedAssetKey =
          data.replace('prem_buy_', '');

        const itemObj =
          premiumPriceChart[selectedAssetKey];

        if (!itemObj) return;

        if (!fs.existsSync(LOCAL_QR_PATH)) {

          return bot.sendMessage(
            chatId,
            `❌ qr.jpg missing in asset folder`
          );

        }

        // ==========================================
        // 📸 QR
        // ==========================================
        await bot.sendPhoto(

          chatId,
          fs.createReadStream(LOCAL_QR_PATH),

          {
            caption:

              `📸 *VELIX PAYMENT GATEWAY*\n` +
              `━━━━━━━━━━━━━━━━━━━\n\n` +

              `📦 Item: *${itemObj.name}*\n` +
              `💳 Amount: *${itemObj.price}*\n\n` +

              `⏳ Payment Window: 2 Minutes\n\n` +

              `1. Scan QR\n` +
              `2. Complete Payment\n` +
              `3. Wait for timer\n\n` +

              `⚠️ Purchase remains pending until approval.`,

            parse_mode: 'Markdown'
          }

        );

        // ==========================================
        // ⏳ TIMER MESSAGE
        // ==========================================
        let timeLeft = 120;

        const timerMsg = await bot.sendMessage(

          chatId,

          `⏳ Payment Timer: 02:00`,

          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '⏩ Skip Timer',
                    callback_data:
                      `skip_${selectedAssetKey}`
                  }
                ]
              ]
            }
          }

        );

        // ==========================================
        // ⏳ LIVE TIMER
        // ==========================================
        activeTimers[chatId] = setInterval(async () => {

          timeLeft--;

          const minutes =
            Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, '0');

          const seconds =
            (timeLeft % 60)
              .toString()
              .padStart(2, '0');

          try {

            await bot.editMessageText(

              `⏳ Payment Timer: ${minutes}:${seconds}`,

              {
                chat_id: chatId,
                message_id: timerMsg.message_id,

                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '⏩ Skip Timer',
                        callback_data:
                          `skip_${selectedAssetKey}`
                      }
                    ]
                  ]
                }
              }

            );

          } catch {}

          // ==========================================
          // ⏳ TIMER END
          // ==========================================
          if (timeLeft <= 0) {

            clearInterval(activeTimers[chatId]);

            await bot.sendMessage(

              chatId,

              `✅ *Payment Window Finished*\n\n` +
              `If payment completed,\n` +
              `click below.`,

              {
                parse_mode: 'Markdown',

                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '✅ I Have Paid',
                        callback_data:
                          `prempaid_${selectedAssetKey}`
                      }
                    ]
                  ]
                }
              }

            );

          }

        }, 1000);

      }

      // ==========================================
      // ⏩ SKIP TIMER
      // ==========================================
      if (data.startsWith('skip_')) {

        await bot.answerCallbackQuery(query.id);

        const assetKey =
          data.replace('skip_', '');

        clearInterval(activeTimers[chatId]);

        return bot.sendMessage(

          chatId,

          `✅ Timer skipped.\n\n` +
          `Click below if payment completed.`,

          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '✅ I Have Paid',
                    callback_data:
                      `prempaid_${assetKey}`
                  }
                ]
              ]
            }
          }

        );

      }

      // ==========================================
      // 🚨 USER PAID
      // ==========================================
      if (data.startsWith('prempaid_')) {

        console.log("✅ PAYMENT BUTTON CLICKED");

        await bot.answerCallbackQuery(
          query.id,
          {
            text: "Payment Request Sent"
          }
        );

        const assetKey =
          data.replace('prempaid_', '');

        const itemObj =
          premiumPriceChart[assetKey];

        if (!itemObj) return;

        const username =
          query.from.username
            ? `@${query.from.username}`
            : query.from.first_name;

        console.log("📨 SENDING TO OWNER");

        // ==========================================
        // 🚨 OWNER REQUEST
        // ==========================================
        await bot.sendMessage(

          ADMIN_ID,

          `🚨 *NEW PAYMENT REQUEST*\n` +
          `━━━━━━━━━━━━━━━━━━━\n\n` +

          `👤 User: ${username}\n` +
          `🆔 User ID: \`${clickerId}\`\n\n` +

          `📦 Item: *${itemObj.name}*\n` +
          `💳 Amount: *${itemObj.price}*`,

          {
            parse_mode: 'Markdown',

            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '✅ Approve',
                    callback_data:
                      `prem_approve_${clickerId}_${assetKey}`
                  },
                  {
                    text: '❌ Decline',
                    callback_data:
                      `prem_reject_${clickerId}`
                  }
                ]
              ]
            }
          }

        );

        return bot.sendMessage(

          chatId,

          `✅ *Payment Notification Sent*\n\n` +
          `Owner has been notified.`,

          {
            parse_mode: 'Markdown'
          }

        );

      }

      // ==========================================
      // ✅ APPROVE
      // ==========================================
      if (data.startsWith('prem_approve_')) {

        await bot.answerCallbackQuery(query.id);

        if (clickerId !== ADMIN_ID) return;

        const chunks = data.split('_');

        const targetUserId = chunks[2];
        const assetIdKey = chunks.slice(3).join('_');

        const itemObj =
          premiumPriceChart[assetIdKey];

        if (!itemObj) return;

        const targetProfile =
          bot.getPlayerData(targetUserId);

        if (!targetProfile) return;

        if (!targetProfile.inventory)
          targetProfile.inventory = [];

        if (!targetProfile.materials)
          targetProfile.materials = {};

        // ==========================================
        // 👑 CARD
        // ==========================================
        if (itemObj.type === "card") {

          const assetObj =
            godCharManifest[assetIdKey] || {
              id: assetIdKey,
              name: itemObj.name
            };

          targetProfile.inventory.push({

            id: assetObj.id || assetIdKey,
            name: assetObj.name,

            rarity: "God-Tier",

            level: 1,
            exp: 0,
            max_xp: 1000,

            power:
              assetObj.power ||
              assetObj.atk ||
              4500,

            atk:
              assetObj.atk ||
              4500,

            image:
              assetObj.image ||
              assetObj.img ||
              "",

            type: "God",

            isAwakened: false,
            awakeningStage: 0

          });

        }

        // ==========================================
        // ✨ MATERIAL
        // ==========================================
        else if (itemObj.type === "material") {

          const baseKey =
            itemObj.target;

          const essenceKey =
            `${baseKey}_god_char_essence`;

          const blessingKey =
            `${baseKey}_god_char_blessing`;

          targetProfile.materials[essenceKey] =
            (
              parseInt(
                targetProfile.materials[essenceKey],
                10
              ) || 0
            ) + 50;

          targetProfile.materials[blessingKey] =
            (
              parseInt(
                targetProfile.materials[blessingKey],
                10
              ) || 0
            ) + 5;

        }

        // ==========================================
        // 💎 UNIVERSAL
        // ==========================================
        else if (itemObj.type === "universal") {

          targetProfile.materials[
            "universal_awakening_stone"
          ] =
            (
              parseInt(
                targetProfile.materials[
                  "universal_awakening_stone"
                ],
                10
              ) || 0
            ) + 1;

        }

        bot.savePlayerData(
          targetUserId,
          targetProfile
        );

        // ==========================================
        // 🎉 USER SUCCESS
        // ==========================================
        await bot.sendMessage(

          targetUserId,

          `🎉 *PAYMENT APPROVED*\n\n` +
          `📦 Delivered:\n` +
          `*${itemObj.name}*`,

          {
            parse_mode: 'Markdown'
          }

        ).catch(() => {});

        // ==========================================
        // ✅ UPDATE OWNER MSG
        // ==========================================
        return bot.editMessageText(

          `✅ *PAYMENT APPROVED*\n\n` +
          `👤 User ID: \`${targetUserId}\`\n` +
          `📦 Delivered: *${itemObj.name}*`,

          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown'
          }

        ).catch(() => {});

      }

      // ==========================================
      // ❌ DECLINE
      // ==========================================
      if (data.startsWith('prem_reject_')) {

        await bot.answerCallbackQuery(query.id);

        if (clickerId !== ADMIN_ID) return;

        const targetUserId =
          data.split('_')[2];

        await bot.sendMessage(

          targetUserId,

          `❌ *PAYMENT DECLINED*`,

          {
            parse_mode: 'Markdown'
          }

        ).catch(() => {});

        return bot.editMessageText(

          `❌ *PAYMENT DECLINED*\n\n` +
          `👤 User ID: \`${targetUserId}\``,

          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown'
          }

        ).catch(() => {});

      }

    } catch (err) {

      console.log(
        "❌ PREMIUM ERROR:",
        err.message
      );

    }

  });

};
