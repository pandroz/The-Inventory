const _ = require('lodash');

const TgUser = require('../models/tgUser');
const ShoppingManager = require('../models/shoppingManager');
const utils = require('../util/utils');
const tgUser = require('../models/tgUser');

exports.startBot = async (ctx) => {
    try {
        // Store or update user in database
        await TgUser.findOneAndUpdate(
            {
                telegramId: ctx.from.id
            },
            {
                telegramId: ctx.from.id,
                username: ctx.from.username,
                firstName: ctx.from.first_name,
                lastName: ctx.from.last_name,
                isActive: true
            },
            {
                upsert: true,
                new: true
            }
        );

        await ctx.reply(`Benvenuto ${ctx.from.first_name}! Sei ora registrato per ricevere notifiche.`);
    } catch (error) {
        console.error('Error saving user:', error);
        await ctx.reply('Si è verificato un errore. Riprova più tardi.');
    }
}

exports.stopBot = async (ctx) => {
    try {
        await TgUser.findOneAndUpdate(
            {
                telegramId: ctx.from.id
            },
            {
                isActive: false,
                lastActive: Date.now()
            }
        );
        await ctx.reply('You will no longer receive notifications. Use /start to subscribe again.');
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

exports.getInfo = (ctx) => {
    const info = `
User ID: ${ctx.from.id}
Username: ${ctx.from.username || 'Not set'}
First Name: ${ctx.from.first_name}`;
    ctx.reply(info);
}

exports.getHelp = (ctx) => {
    ctx.reply(`Commands:
/start - Start bot
/help - Show help
/info - Get info
/list - Get shopping list
/GG - Sei ggReeck`);
}

exports.getShoppingList = (ctx) => {
    let list = ShoppingManager.find()
        .populate('item')
        .sort({ buyPriority: -1 })
        .then(result => {
            ctx.replyWithHTML(utils.formatShoppingList(result));
        });
}

exports.getGG = (ctx) => {
    ctx.reply('HAI RAGIONE!');
}

exports.sendMessageToUser = async (bot, telegramId, message) => {
    try {
        await bot.telegram.sendMessage(telegramId, message, {
            parse_mode: 'HTML'
        });
        
        return { success: true };
    } catch (error) {
        console.error(`Failed to send message to ${telegramId}:`, error);

        // If user blocked the bot, mark as inactive
        if (error.response && error.response.error_code === 403) {
            await tgUser.findOneAndUpdate({
                telegramId: telegramId
            },
            {
                isActive: false,
                hasBlockedBot: true
            });
        }

        return { 
            success: false,
            error: error.message 
        };
    }
}