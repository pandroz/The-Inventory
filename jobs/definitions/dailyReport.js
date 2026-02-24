const { sendEmail } = require('../../services/mailer');
const User = require('../../models/user');
const _ = require('lodash');
const tgBot = require('../../services/telegramBot');


const locale_options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
};

module.exports = (agenda) => {
    return agenda.define('Daily Report', async (job) => {
        try {
            console.log(`${new Date().toISOString()} - [JOBS - Daily Report Job]  Sending daily report`);

            let itemsCloseToExpiry = await User.aggregate([
                {
                    "$match": {
                        "isBlocked": { $ne: true },
                        "isDeleted": { $ne: true },
                    }
                },
                {
                    "$project": {
                        "email": 1,
                        "telegramId": 1,
                        "username": 1,
                        "name": 1,
                        "lastName": 1,
                        "userPreferences": 1
                    }
                },
                {
                    "$lookup": {
                        "from": "userpreferences",
                        "localField": "userPreferences",
                        "foreignField": "_id",
                        "as": "userPreferences"
                    }
                },
                {
                    "$unwind": "$userPreferences"
                },
                {
                    "$match": {
                        "userPreferences.dailyReportSubscription": true
                    }
                },
                {
                    "$lookup": {
                        "from": "items",
                        "localField": "_id",
                        "foreignField": "userId",
                        "as": "items"
                    }
                },
                {
                    "$lookup": {
                        "from": "tgusers",
                        "localField": "telegramId",
                        "foreignField": "_id",
                        "as": "telegramUser"
                    }
                },
                {
                    "$unwind": {
                        "path": "$telegramUser",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        "from": "todos",
                        "localField": "_id",
                        "foreignField": "userId",
                        "as": "todos"
                    }
                },
                {
                    "$project": {
                        "email": 1,
                        "telegramId": 1,
                        "username": 1,
                        "name": 1,
                        "lastName": 1,
                        "userPreferences": 1,
                        "telegramUser": 1,
                        "expiredItems": {
                            "$filter": {
                                "input": "$items",
                                "as": "item",
                                "cond": {
                                    "$and": [
                                        {
                                            "$or": [
                                                { "$gte": ["$$item.expirationDate", new Date().setHours(0, 0, 0, 0)] },
                                                { "$lte": ["$$item.expirationDate", new Date(new Date().setHours(0, 0, 0, 0) + 7 * 24 * 60 * 60 * 1000)] }
                                            ]
                                        },
                                        {
                                            "$and": [
                                                { "$ne": ["$$item.expirationDate", null] },
                                                { "$ne": ["$$item.expirationDate", ""] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        "lowStockItems": {
                            "$filter": {
                                "input": "$items",
                                "as": "item",
                                "cond": {
                                    "$and": [
                                        {
                                            "$expr": {
                                                "$lte": ["$$item.qty", "$$item.lowStockAlert"]
                                            }
                                        },
                                        {
                                            "$ne": ["$$item.lowStockAlert", null]
                                        }
                                    ]
                                }
                            }
                        },
                        "todosDueSoon": {
                            "$filter": {
                                "input": "$todos",
                                "as": "todo",
                                "cond": {
                                    "$and": [
                                        {
                                            "$or": [
                                                { "$gte": ["$$todo.completeBy", new Date().setHours(0, 0, 0, 0)] },
                                                { "$lte": ["$$todo.completeBy", new Date(new Date().setHours(0, 0, 0, 0) + 7 * 24 * 60 * 60 * 1000)] }
                                            ]
                                        },
                                        {
                                            "$and": [
                                                { "$eq": ["$$todo.done", false] },
                                                { "$ne": ["$$todo.completeBy", null] },
                                                { "$ne": ["$$todo.completeBy", ""] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            ]);

            _.each(itemsCloseToExpiry, async data => {
                let htmlMessage;
                try {
                    htmlMessage = createMessage(data);
                } catch (err) {
                    console.log(`[dailyReport] Error creating message for user ${data._id}:`, err);
                    return;
                }
                
                const { email, telegramUser, userPreferences } = data;

                // Send email if enabled and user has email notifications on
                if (process.env.SMTP_ACTIVATED === 'true' && userPreferences.emailNotifications) {
                    await sendEmail({
                        to: email,
                        subject: `Daily Report - ${new Date().toDateString()}`,
                        htmlMessage,
                    });

                    console.log(`Email sent to ${email} with ${items.length} items close to expiry.`);
                }

                // Send Telegram message if enabled and user has Telegram notifications on
                if (telegramUser && userPreferences.telegramNotifications) {
                    try {
                        await tgBot.sendMessageToUser(tgBot, telegramUser.telegramId, htmlMessage);
                    } catch (err) {
                        console.log(`[dailyReport] Error sending Telegram message to ${telegramUser.telegramId}:`, err);
                    }
                }

            });

        } catch (err) {
            console.log(`${new Date().toISOString()} - [JOBS - Daily Report Job]  Error in Daily Report job:`, err);
            return;
        }
    });
};




const createMessage = (data) => {
    const { expiredItems, lowStockItems, todosDueSoon, username, name, lastName } = data;

    let displayName = `${name} ${lastName}`;

    if (_.isEmpty(lastName) || _.isEmpty(name)) {
        displayName = username || 'there';
    }

    let html = `Ciao <b>${displayName},</b>\n\n`;

    html += formatDailyReport({
        expiryItems: expiredItems,
        stockItems: lowStockItems,
        todos: _.orderBy(todosDueSoon, 'completeBy', 'asc')
    })

    return html;

}


// ─── Helpers ────────────────────────────────────────────────────────────────

const getDaysOffset = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

const plural = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

const sectionHeader = (icon, title, count) =>
    `${icon} <b>${title}</b> · ${plural(count, 'elemento', 'elementi')}\n` +
    `─────────────────────\n`;

// ─── Individual Sections ─────────────────────────────────────────────────────

const formatExpiredProducts = (items) => {
    if (!items.length) return '';

    let section = sectionHeader('🚨', 'PRODOTTI SCADUTI', items.length);
    items.forEach((item, i) => {
        const daysAgo = Math.abs(getDaysOffset(item.expirationDate));
        section += `${i + 1}. <b>${item.name}</b>\n`;
        section += `    ⏱ Scaduto ${plural(daysAgo, 'giorno', 'giorni')} fa\n\n`;
    });

    return section;
};

const formatCloseToExpiryProducts = (items) => {
    if (!items.length) return '';

    let section = sectionHeader('⚠️', 'IN SCADENZA', items.length);
    items.forEach((item, i) => {
        const days = getDaysOffset(item.expirationDate);
        const urgency = days === 0 ? '🔴' : days <= 3 ? '🟠' : '🟡';
        section += `${i + 1}. <b>${item.name}</b> ${urgency}\n`;
        section += `    📅 <code>${new Date(item.expirationDate).toLocaleDateString('it-IT')}</code>`;
        section += ` · ${days === 0 ? 'oggi!' : plural(days, 'giorno', 'giorni')}\n`;
        if (item.category) section += `    🏷 <code>${item.category}</code>\n`;
        section += `\n`;
    });

    return section;
};

const formatLowStock = (items) => {
    if (!items.length) return '';

    let section = sectionHeader('📦', 'SCORTE BASSE', items.length);
    items.forEach((item, i) => {
        section += `${i + 1}. <b>${item.name}</b>\n`;
        section += `    🔢 Qtà attuale: <code>${item.qty}</code> · Soglia: <code>${item.lowStockAlert}</code>\n`;
        if (item.category) section += `    🏷 <code>${item.category}</code>\n`;
        section += `\n`;
    });

    return section;
};

const formatExpiredTodos = (todos) => {
    if (!todos.length) return '';

    let section = sectionHeader('❌', 'TO-DO SCADUTE', todos.length);
    todos.forEach((todo, i) => {
        const daysAgo = Math.abs(getDaysOffset(todo.completeBy));
        section += `${i + 1}. <b>${todo.description}</b>\n`;
        section += `    📅 <code>${new Date(todo.completeBy).toLocaleDateString('it-IT')}</code>`;
        section += ` · Scaduta ${plural(daysAgo, 'giorno', 'giorni')} fa\n`;
        if (todo.category) section += `    🏷 <code>${todo.category}</code>\n`;
        section += `\n`;
    });

    return section;
};

const formatDueSoonTodos = (todos) => {
    if (!todos.length) return '';

    let section = sectionHeader('⏰', 'TO-DO IN SCADENZA', todos.length);
    todos.forEach((todo, i) => {
        const days = getDaysOffset(todo.completeBy);
        const urgency = days === 0 ? '🔴' : days <= 3 ? '🟠' : '🟡';
        section += `${i + 1}. <b>${todo.description}</b> ${urgency}\n`;
        section += `    📅 <code>${new Date(todo.completeBy).toLocaleDateString('it-IT')}</code>`;
        section += ` · ${days === 0 ? 'oggi!' : plural(days, 'giorno', 'giorni')}\n`;
        if (todo.category) section += `    🏷 <code>${todo.category}</code>\n`;
        section += `\n`;
    });

    return section;
};

// ─── Public Exports ───────────────────────────────────────────────────────────

const formatCloseToExpiryList = (items) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expired = _.filter(items, item => getDaysOffset(item.expirationDate) < 0);
    const closeSoon = _.filter(items, item => {
        const days = getDaysOffset(item.expirationDate);
        return days >= 0 && days <= 7;
    });

    if (!expired.length && !closeSoon.length) {
        return '✅ Nessun prodotto scaduto o in scadenza.';
    }

    return [
        formatExpiredProducts(expired),
        formatCloseToExpiryProducts(closeSoon),
    ].filter(Boolean).join('\n').trim();
};

exports.formatLowStockList = (items) => {
    if (!items.length) return '✅ Nessun prodotto sotto la soglia minima.';
    return formatLowStock(items).trim();
};

const formatTodoList = (todos) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expired = todos.filter(t => new Date(t.completeBy) < today);
    const dueSoon = todos.filter(t => new Date(t.completeBy) >= today);

    if (!expired.length && !dueSoon.length) {
        return '✅ Nessuna attività in scadenza!';
    }

    return [
        formatExpiredTodos(expired),
        formatDueSoonTodos(dueSoon),
    ].filter(Boolean).join('\n').trim();
};

// ─── Combined Report (all data in one message) ────────────────────────────────

const formatDailyReport = ({ expiryItems = [], stockItems = [], todos = [] }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredProducts = _.filter(expiryItems, i => getDaysOffset(i.expirationDate) < 0);
    const closeSoonProducts = _.filter(expiryItems, i => {
        const d = getDaysOffset(i.expirationDate);
        return d >= 0 && d <= 7;
    });
    const expiredTodos = todos.filter(t => new Date(t.completeBy) < today);
    const dueSoonTodos = todos.filter(t => new Date(t.completeBy) >= today);

    const allEmpty =
        !expiredProducts.length && !closeSoonProducts.length &&
        !stockItems.length &&
        !expiredTodos.length && !dueSoonTodos.length;

    if (allEmpty) {
        return '✅ Tutto in ordine! Nessuna notifica per oggi.';
    }

    const divider = `\n〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\n\n`;

    const sections = [
        formatExpiredProducts(expiredProducts),
        formatCloseToExpiryProducts(closeSoonProducts),
        formatLowStock(stockItems),
        formatExpiredTodos(expiredTodos),
        formatDueSoonTodos(dueSoonTodos),
    ].filter(Boolean);

    const date = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    const header = `📋 <b>Report del ${date}</b>\n\n`;

    return header + sections.join(divider).trim();
};