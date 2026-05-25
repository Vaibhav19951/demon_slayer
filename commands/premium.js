/**
 * VELIX OS V3.0 | PREMIUM PAYMENT SYSTEM
 * QR + TIMER + SKIP TIMER + OWNER APPROVAL
 */

const fs = require("fs");
const path = require("path");

const godTierRegistry = require("../asset/godchar");
const godCharManifest = godTierRegistry.godTierManifest || {};

console.log("💎 PREMIUM SYSTEM LOADED");

module.exports = (bot) => {

  const ADMIN_ID = "2086993762";

  // ==========================================
  // ⏳ ACTIVE TIMERS
  // ==========================================
  const activeTimers = {};

  // ==========================================
  // 💳 SHOP DATABASE
  // ==========================================
  const premiumPriceChart = {

    yoriichi_godtier: {
      name: "Yoriichi Tsugikuni Card",
      price: "₹499",
      type: "card"
    },

    muzan_godtier: {
      name: "Muzan Kibutsuji Card",
      price: "₹399",
      type: "card"
    },

    kokushibo_godtier: {
      name: "Kokushibo Card",
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
    path.join(process.cwd(), "asset", "qr.jpg");

  // ==========================================
  // 👑 /premium
  // ==========================================
  bot.onText(/\/premium/, async (msg) => {

    const chatId = msg.chat.id;

    await bot.sendMessage(

      chatId,

      `👑 VELIX PREMIUM SHOP

Choose a category below.`,

      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✨ Essence & Materials",
                callback_data: "prem_shop_essence"
              },
              {
                text: "👑 God Cards",
                callback_data: "prem_view_godtier"
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
  bot.on("callback_query", async (query) => {

    const chatId = query.message.chat.id;
    const clickerId = query.from.id.toString();
    const data = query.data;
    const messageId = query.message.message_id;

    if (
      !data.startsWith("prem_") &&
      !data.startsWith("prempaid_") &&
      !data.startsWith("skip_")
    ) return;

    try {

      // ==========================================
      // 👑 VIEW CARDS
      // ==========================================
      if (data === "prem_view_godtier") {

        await bot.answerCallbackQuery(query.id);

        return bot.sendMessage(

          chatId,

          `👑 GOD CARD SHOP

⚔️ Yoriichi ➜ ₹499
👹 Muzan ➜ ₹399
🌙 Kokushibo ➜ ₹199`,

          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "⚔️ Buy Yoriichi",
                    callback_data:
                      "prem_buy_yoriichi_godtier"
                  }
                ],
                [
                  {
                    text: "👹 Buy Muzan",
                    callback_data:
                      "prem_buy_muzan_godtier"
                  }
                ],
                [
                  {
                    text: "🌙 Buy Kokushibo",
                    callback_data:
                      "prem_buy_kokushibo_godtier"
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
      if (data === "prem_shop_essence") {

        await bot.answerCallbackQuery(query.id);

        return bot.sendMessage(

          chatId,

          `✨ MATERIAL SHOP

🧬 Yoriichi Pack ➜ ₹249
🧪 Muzan Pack ➜ ₹199
🌙 Kokushibo Pack ➜ ₹149
💎 Awakening Stone ➜ ₹99`,

          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🧬 Yoriichi Pack",
                    callback_data:
                      "prem_buy_yoriichi_essence_pack"
                  }
                ],
                [
                  {
                    text: "🧪 Muzan Pack",
                    callback_data:
                      "prem_buy_muzan_essence_pack"
                  }
                ],
                [
                  {
                    text: "🌙 Kokushibo Pack",
                    callback_data:
                      "prem_buy_kokushibo_essence_pack"
                  }
                ],
                [
                  {
                    text: "💎 Awakening Stone",
                    callback_data:
                      "prem_buy_universal_awakening_stone"
                  }
                ]
              ]
            }
          }

        );

      }

      // ==========================================
      // 💳 BUY SYSTEM
      // ==========================================
      if (data.startsWith("prem_buy_")) {

        await bot.answerCallbackQuery(query.id);

        const selectedAssetKey =
          data.replace("prem_buy_", "");

        const itemObj =
          premiumPriceChart[selectedAssetKey];

        if (!itemObj) return;

        if (!fs.existsSync(LOCAL_QR_PATH)) {

          return bot.sendMessage(
            chatId,
            "❌ qr.jpg missing inside asset folder."
          );

        }

        // ==========================================
        // 📸 SEND QR
        // ==========================================
        await bot.sendPhoto(

          chatId,
          fs.createReadStream(LOCAL_QR_PATH),

          {
            caption:

              `📸 PAYMENT GATEWAY

📦 Item: ${itemObj.name}
💳 Amount: ${itemObj.price}

1. Scan QR
2. Complete Payment
3. Wait for timer

⏳ Payment Window: 2 Minutes`

          }

        );

        // ==========================================
        // ⏳ TIMER
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
                    text: "⏩ Skip Timer",
                    callback_data:
                      `skip_${selectedAssetKey}`
                  }
                ]
              ]
            }
          }

        );

        activeTimers[chatId] = setInterval(async () => {

          timeLeft--;

          const minutes =
            Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, "0");

          const seconds =
            (timeLeft % 60)
              .toString()
              .padStart(2, "0");

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
                        text: "⏩ Skip Timer",
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
          // ⏳ TIMER FINISH
          // ==========================================
          if (timeLeft <= 0) {

            clearInterval(activeTimers[chatId]);

            await bot.sendMessage(

              chatId,

              `✅ Payment window finished.

Click below if payment completed.`,

              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "✅ I Have Paid",
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
      if (data.startsWith("skip_")) {

        await bot.answerCallbackQuery(query.id);

        const assetKey =
          data.replace("skip_", "");

        clearInterval(activeTimers[chatId]);

        return bot.sendMessage(

          chatId,

          `✅ Timer skipped.

Click below if payment completed.`,

          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "✅ I Have Paid",
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
      // 🚨 USER CLICKED PAID
      // ==========================================
      if (data.startsWith("prempaid_")) {

        await bot.answerCallbackQuery(
          query.id,
          {
            text: "Payment request sent."
          }
        );

        const assetKey =
          data.replace("prempaid_", "");

        const itemObj =
          premiumPriceChart[assetKey];

        if (!itemObj) return;

        const username =
          query.from.username
            ? `@${query.from.username}`
            : query.from.first_name;

        // ==========================================
        // 🚨 SEND TO OWNER
        // ==========================================
        await bot.sendMessage(

          ADMIN_ID,

          `🚨 NEW PAYMENT REQUEST

👤 User: ${username}
🆔 User ID: ${clickerId}

📦 Item: ${itemObj.name}
💳 Amount: ${itemObj.price}

Approve or decline below.`,

          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "✅ Approve",
                    callback_data:
                      `prem_approve_${clickerId}_${assetKey}`
                  },
                  {
                    text: "❌ Decline",
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

          `✅ Owner has been notified.
Please wait for approval.`

        );

      }

      // ==========================================
      // ✅ APPROVE PAYMENT
      // ==========================================
      if (data.startsWith("prem_approve_")) {

        await bot.answerCallbackQuery(query.id);

        if (clickerId !== ADMIN_ID) return;

        const chunks = data.split("_");

        const targetUserId = chunks[2];
        const assetIdKey =
          chunks.slice(3).join("_");

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
        // ✨ MATERIALS
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
        // 💎 UNIVERSAL STONE
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
        // 🎉 USER MESSAGE
        // ==========================================
        await bot.sendMessage(

          targetUserId,

          `🎉 PAYMENT APPROVED

📦 Delivered:
${itemObj.name}`

        ).catch(() => {});

        // ==========================================
        // ✅ EDIT OWNER MESSAGE
        // ==========================================
        return bot.editMessageText(

          `✅ PAYMENT APPROVED

👤 User ID: ${targetUserId}
📦 Delivered: ${itemObj.name}`,

          {
            chat_id: chatId,
            message_id: messageId
          }

        ).catch(() => {});

      }

      // ==========================================
      // ❌ DECLINE PAYMENT
      // ==========================================
      if (data.startsWith("prem_reject_")) {

        await bot.answerCallbackQuery(query.id);

        if (clickerId !== ADMIN_ID) return;

        const targetUserId =
          data.split("_")[2];

        await bot.sendMessage(

          targetUserId,

          `❌ PAYMENT DECLINED`

        ).catch(() => {});

        return bot.editMessageText(

          `❌ PAYMENT DECLINED

👤 User ID: ${targetUserId}`,

          {
            chat_id: chatId,
            message_id: messageId
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
