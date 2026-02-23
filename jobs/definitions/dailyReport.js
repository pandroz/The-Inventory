const { sendEmail } = require('../../services/mailer');
const User = require('../../models/user');
const { formatCloseToExpiryList, formatLowStockList, formatTodoList } = require('../../util/utils');
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

    let html = `Ciao <b>${displayName},</b>\n\n<b>Daily Report for ${_.capitalize(new Date().toLocaleDateString('it-IT', locale_options))}!</b>\n\n`

    // html += `Items close to expiry: <b>${expiredItems.length}</b>\n`;
    html += formatCloseToExpiryList(expiredItems);

    html += `\n\n`; // Add spacing between sections

    // html += `\n\nItems with low stock: <b>${lowStockItems.length}</b>\n`;
    html += formatLowStockList(lowStockItems);

    html += `\n\n`; // Add spacing between sections

    // html += `\n\nTodos due soon: <b>${todosDueSoon.length}</b>\n`;
    html += formatTodoList(_.orderBy(todosDueSoon, 'completeBy', 'asc'));

    return html;

}