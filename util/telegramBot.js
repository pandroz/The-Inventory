const { Telegraf, Telegram } = require('telegraf');
const { message } = require('telegraf/filters');    
const _ = require('lodash');

const TelegramBot = require('../controllers/telegramBot');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Commands
bot.command('start', TelegramBot.startBot);

bot.command('stop', TelegramBot.stopBot);

bot.command('list', TelegramBot.getShoppingList);

bot.command('help', TelegramBot.getHelp);

bot.command('info', TelegramBot.getInfo);

bot.command('GG', TelegramBot.getGG);




// Handle all text messages
bot.on(message('text'), async (ctx) => {
    const text = ctx.message.text;

    // Don't echo commands
    if (!text.startsWith('/')) {
        await ctx.reply(`You said: ${text}`);
    }
});

// Handle photos
bot.on(message('photo'), async (ctx) => {
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    await ctx.reply(`Nice photo! File ID: ${photo.file_id}`);
});

// Handle documents
bot.on(message('document'), async (ctx) => {
    const doc = ctx.message.document;
    await ctx.reply(`Received document: ${doc.file_name}`);
});


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

module.exports = bot;