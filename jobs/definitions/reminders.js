const _ = require('lodash');
const ToDo = require('../../models/todo');
const tgUser = require('../../models/tgUser');
const tgBot = require('../../services/telegramBot');

module.exports = (agenda) => {
    return agenda.define('Reminders', async (job) => {
        try {
            console.log(`${new Date().toISOString()} - [JOBS - Reminders Job] Checking reminders`);

            const SAME_DAY_MIDNIGTH = new Date(new Date().setHours(0, 0, 0, 0));
            const TOMORROW_MIDNIGHT = new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0, 0, 0, 0));

            let pipeline = [
                {
                    $match: {
                        done: {
                            $ne: true
                        },
                        $or: [
                            {
                                completeBy: {
                                    $gte: SAME_DAY_MIDNIGTH,
                                    $lte: TOMORROW_MIDNIGHT
                                }
                            },
                            {
                                remindMe: true,
                                reminderDate: {
                                    $gte: SAME_DAY_MIDNIGTH,
                                    $lte: TOMORROW_MIDNIGHT
                                }
                            },
                            {
                                recurringPattern: {
                                    $ne: null
                                },
                                recurringStartDate: {
                                    $lt: new Date()
                                },
                                recurringEndDate: {
                                    $gt: new Date()
                                }
                            }
                        ]
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        todo: {
                            $push: '$$ROOT'
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                }
            ];

            const userTodo = await ToDo.aggregate(pipeline);

            console.log(`${new Date().toISOString()} - [JOBS - Reminders Job] Found ${userTodo.length} toDos`);
            // console.log(`${new Date().toISOString()} - [JOBS - Reminders Job] ToDos: ${JSON.stringify(userTodo, null, 4)} `);

            await _.each(userTodo, async (user, userId) => {
                let toDoList = _.get(user, 'todo', []);

                let htmlMessage = `<b>${user.user.name} ${user.user.lastName}</b>\n\n`;

                toDoList.forEach((todo, i) => {
                    htmlMessage += `${i + 1}. <b>${todo.description}</b>\n\n`;
                });

                let telegramUser = await tgUser.findOne(user.user.telegramId);
                // console.log('telegramUser', telegramUser);
                // if (telegramUser)
                    // Comment this line to avoid spamming messages for now
                    // await tgBot.sendMessageToUser(tgBot, telegramUser.telegramId, htmlMessage);

            });



        } catch (error) {
            console.log(`${new Date().toISOString()} - [JOBS - Reminders Job]  Error: ${error}`);
        }

    });
};