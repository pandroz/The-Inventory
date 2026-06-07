const { sendEmail } = require('../../services/mailer');
const User = require('../../models/user');
const _ = require('lodash');


const locale_options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
};

module.exports = (agenda) => {
    return agenda.define('Channel Renewal', async (job) => {
        try {
            console.log(`${new Date().toISOString()} - [JOBS - Channel Renewal] Checking channels for renewal`);

            const users = await User.findChannelsExpiringWithin(24 * 60 * 60 * 1000); // expiring in 24h

            for (const user of users) {
                try {
                    // Stop old channel
                    await stopWatchChannel(user.tokens, user.channelId, user.resourceId);

                    // Register a new one
                    const channel = await registerWatchChannel(user.tokens);

                    // Save new channel info to user
                    await User.updateChannelInfo(user.id, channel);
                } catch (err) {
                    console.error(`Failed to renew channel for user ${user.id}:`, err);
                }
            }


        } catch (err) {
            console.log(`${new Date().toISOString()} - [JOBS - Channel Renewal]  Error in Channel Renewal job:`, err);
            return;
        }
    });
};