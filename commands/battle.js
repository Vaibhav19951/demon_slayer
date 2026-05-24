console.log("⚔️ BATTLE SYSTEM ONLINE (VELIX OS V2.5) - ENHANCED SECURITY & TASK SYNC");

const fs = require("fs");
const path = require("path");
const demons = require("../asset/demons");

const playerFile = path.join(__dirname, "../data/players.json");

const battles = {};

module.exports = (bot) => {
  
  // Dynamic Mission Progression Monitor Engine
  const incrementTaskProgress = (userId, freshPlayers, msg) => {
    let p = freshPlayers[userId];

    if (p && p.active_task && p.active_task.id === "battle" && !p.active_task.completed) {
      p.active_task.progress += 1;
      
      // If Target Objective is reached
      if (p.active_task.progress >= p.active_task.target) {
        p.active_task.completed = true;
        p.mythic = Number(p.mythic || 0) + 20; // Token Reward aligned to mythic
        p.exp = Number(p.exp || 0) + 50;       // EXP Reward aligned to exp
        
        bot.sendMessage(msg.chat.id, `🎉 **DAILY MISSION COMPLETED!**\n✨ User: *${msg.from.first_name}*\n🎁 Rewards Unlocked: *+20 Mythic Tokens* & *+50 XP*!`);
      }
    }
  };

  // Command Initialization
  bot.onText(/\/battle/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    if (battles[userId]) return bot.sendMessage(chatId, "⚠️ You are already in a battle!");

    const demon = demons[Math.floor(Math.random() * demons.length)];
    battles[userId] = { demon, playerHp: 150, demonHp: demon.hp, shield: false };

    await bot.sendPhoto(chatId, demon.image, {
      caption: `👹 **A Demon Appeared!**\n\n🏷 **Name:** ${demon.name}\n❤️ **HP:** ${demon.hp}\n🗡 **ATK:** ${demon.attack}\n\nWhat will you do?`,
      parse_mode: "Markdown",
      reply_markup: {
        // Appending owner ID onto callback strings for direct security filtering
        inline_keyboard: [[{ text: "⚔️ Slay", callback_data: `slay_${userId}` }, { text: "🏃 Run", callback_data: `run_${userId}` }]]
      }
    });
  });

  // Action Button Operations
  bot.on("callback_query", async (query) => {
    if (!query.data.includes("_")) return;
    const [action, targetUserId] = query.data.split("_");
    
    const validBattleActions = ["slay", "run", "attack", "shield"];
    if (!validBattleActions.includes(action)) return;

    const clickerId = query.from.id.toString();

    // 🔥 SECURITY LOCK: Prevent other users from tapping on your battle menu panel
    if (clickerId !== targetUserId) {
      return bot.answerCallbackQuery(query.id, { 
        text: "❌ This is not your battle! Type /battle to summon your own demon.", 
        show_alert: true 
      });
    }

    if (!battles[targetUserId]) return bot.answerCallbackQuery(query.id, { text: "❌ No active battle found!", show_alert: true });

    const battle = battles[targetUserId];
    const demon = battle.demon;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (action === "run") {
      delete battles[targetUserId];
      await bot.editMessageCaption(`🏃 You escaped safely from ${demon.name}!`, { chat_id: chatId, message_id: messageId });
    } 
    else if (action === "slay") {
      await bot.editMessageCaption(`⚔️ **Battle Started Against ${demon.name}!**\n\n❤️ Your HP: ${battle.playerHp}\n👹 Demon HP: ${battle.demonHp}`, {
        chat_id: chatId, message_id: messageId, parse_mode: "Markdown",
        reply_markup: { 
          inline_keyboard: [
            [{ text: "🗡 Attack", callback_data: `attack_${targetUserId}` }, { text: "🛡 Shield", callback_data: `shield_${targetUserId}` }], 
            [{ text: "🏃 Run", callback_data: `run_${targetUserId}` }]
          ] 
        }
      });
    }
    else if (action === "shield") {
      battle.shield = true;
      bot.answerCallbackQuery(query.id, { text: "🛡 Shield Activated!" });
      return;
    }
    else if (action === "attack") {
      const playerDamage = Math.floor(Math.random() * 20) + 15;
      battle.demonHp -= playerDamage;

      // WIN CONDITION REACHED
      if (battle.demonHp <= 0) {
        let freshPlayers = {};
        try {
          if (fs.existsSync(playerFile)) {
            freshPlayers = JSON.parse(fs.readFileSync(playerFile, "utf8"));
          }
        } catch (err) {
          console.error("🔥 Error reading player file database:", err);
        }

        if (!freshPlayers[targetUserId]) {
          freshPlayers[targetUserId] = { coins: 500, bank: 0, crystals: 0, mythic: 0, level: 1, exp: 0, guildId: null, inventory: [], active_task: null };
        }

        const rCoins = parseInt(demon.reward) || 50;
        const rXp = parseInt(demon.exp) || 20;

        // Structured Database alignment mapping keys to profile architecture
        const currentCoins = Number(freshPlayers[targetUserId].coins || 0);
        const currentXp = Number(freshPlayers[targetUserId].exp || 0); // Corrected from xp to exp
        let currentLevel = Number(freshPlayers[targetUserId].level || 1);

        freshPlayers[targetUserId].coins = currentCoins + Number(rCoins);
        
        // Progression processing stack
        let totalXp = currentXp + Number(rXp);
        let xpNeeded = currentLevel * 100;
        let levelUpMessage = "";

        while (totalXp >= xpNeeded) {
          totalXp -= xpNeeded;
          currentLevel += 1;
          xpNeeded = currentLevel * 100;
          levelUpMessage = `\n\n🎉 **LEVEL UP!** You have reached **Level ${currentLevel}**!`;
        }

        freshPlayers[targetUserId].level = currentLevel;
        freshPlayers[targetUserId].exp = totalXp < 0 ? 0 : totalXp; // Corrected from xp to exp

        // Daily task progress evaluation sequence before data dump commit
        incrementTaskProgress(targetUserId, freshPlayers, query.message);

        try {
          fs.writeFileSync(playerFile, JSON.stringify(freshPlayers, null, 2), "utf8");
          console.log(`✅ Data saved for ${targetUserId}. Coins: ${freshPlayers[targetUserId].coins}, EXP: ${freshPlayers[targetUserId].exp}, LVL: ${freshPlayers[targetUserId].level}`);
        } catch (err) {
          console.error("🔥 Error saving file to database storage:", err);
        }

        delete battles[targetUserId];

        await bot.editMessageCaption(`🏆 **YOU WON!**\n💰 **+${rCoins} Coins**\n✨ **+${rXp} XP**${levelUpMessage}\n\n✅ Profile synced live with database.`, { 
          chat_id: chatId, 
          message_id: messageId, 
          parse_mode: "Markdown" 
        });
      } 
      else {
        // Enemy Retaliation Turn Phase
        let dDmg = Math.floor(Math.random() * (demon.attack || 15)) + 5;
        if (battle.shield) { 
          dDmg = Math.floor(dDmg / 2); 
          battle.shield = false; 
        }
        battle.playerHp -= dDmg;

        if (battle.playerHp <= 0) {
          delete battles[targetUserId];
          await bot.editMessageCaption(`☠️ **You were defeated by ${demon.name}!**`, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown" });
        } else {
          await bot.editMessageCaption(`🗡 You dealt ${playerDamage} dmg!\n👹 Demon HP: ${battle.demonHp}\n❤️ Your HP: ${battle.playerHp}`, {
            chat_id: chatId, message_id: messageId, parse_mode: "Markdown",
            reply_markup: { 
              inline_keyboard: [
                [{ text: "🗡 Attack", callback_data: `attack_${targetUserId}` }, { text: "🛡 Shield", callback_data: `shield_${targetUserId}` }], 
                [{ text: "🏃 Run", callback_data: `run_${targetUserId}` }]
              ] 
            }
          });
        }
      }
    }
    bot.answerCallbackQuery(query.id);
  });
};
