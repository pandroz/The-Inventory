const _ = require('lodash');
const ToDo = require('../../models/todo');
const tgBot = require('../../services/telegramBot');

module.exports = (agenda) => {
    return agenda.define('Reminders', async (job) => {
        try {
            console.log(`${new Date().toISOString()} - [JOBS - Reminders Job] Checking reminders`);
            
            const SAME_DAY_MIDNIGTH = new Date().setHours(0,0,0,0);
            const TOMORROW_MIDNIGHT = new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0, 0, 0, 0);

            const toDos = await ToDo.aggregate([
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
            ]);

            console.log(`${new Date().toISOString()} - [JOBS - Reminders Job] Found ${toDos.length} toDos`);
            console.log(`${new Date().toISOString()} - [JOBS - Reminders Job] ToDos: ${JSON.stringify(toDos, null, 4)} `);

            
            await tgBot.sendMessageToUser(tgBot, telegramUser.telegramId, htmlMessage);


        } catch (error) {
            console.log(`${new Date().toISOString()} - [JOBS - Reminders Job]  Error: ${error}`);
        }

    });
};