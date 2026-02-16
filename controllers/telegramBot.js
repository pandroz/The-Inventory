const _ = require('lodash');

const TgUser = require('../models/tgUser');
const ShoppingManager = require('../models/shoppingManager');

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
            ctx.replyWithHTML(formatShoppingList(result));
        });
}

exports.getGG = (ctx) => {
    ctx.reply('HAI RAGIONE!');
}





function formatShoppingList(items) {
    console.log('Items: ', items);
    if (items.length === 0) {
        return '🛒 Your shopping list is empty!';
    }

    let message = '╔══════🛒 Shopping List ═════╗\n\n';

    items.forEach((item, index) => {
        console.log('Item: ', item);
        message += `  ${index + 1}│ <b>${item.itemName}</b>\n`;
        message += `   ╰─ Quantità: <code>${item.itemQty}</code>\n\n`;
    });

    message += `╚═══════════════════════╝\n`;
    message += `📦 Totale: <b>${items.length}</b> cose da comprare`;

    return message;
}