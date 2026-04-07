const { listEvents } = require('../services/googleCalendar');
const Event = require('../models/event');
const User = require('../models/user');

exports.handleCalendarWebhook = async (req, res) => {

    console.log('Webhook received');

    // Always acknowledge immediately — Google will retry if you don't
    res.sendStatus(200);

    const resourceState = req.headers['x-goog-resource-state'];
    const channelToken = req.headers['x-goog-channel-token'];

    // Validate the token to make sure the request is from Google
    if (channelToken !== process.env.WEBHOOK_SECRET) {
        console.warn('Invalid webhook token received');
        return;
    }

    // 'sync' is just Google confirming the channel was created — ignore it
    if (resourceState === 'sync') return;

    // 'exists' means something was created/updated/deleted
    if (resourceState === 'exists') {
        try {
            // Find the user this channel belongs to
            // (you stored channelId → userId when registering)
            const channelId = req.headers['x-goog-channel-id'];
            const user = await User.findByChannelId(channelId);
            if (!user) return;

            // Use the stored syncToken to only fetch what changed
            const response = await listEvents(user.tokens, user.syncToken);
            const { items, nextSyncToken } = response.data;

            // Save the new syncToken for next time
            await User.updateSyncToken(user.id, nextSyncToken);

            // Upsert each changed event
            for (const googleEvent of items) {
                await Event.findOneAndUpdate(
                    { googleEventId: googleEvent.id },
                    {
                        userId: user.id,
                        googleEventId: googleEvent.id,
                        title: googleEvent.summary,
                        start: googleEvent.start,
                        end: googleEvent.end,
                        status: googleEvent.status, // 'cancelled' means it was deleted
                        source: 'google',
                        rawGoogleEvent: googleEvent,
                    },
                    { upsert: true, new: true }
                );
            }
        } catch (err) {
            console.error('Webhook sync error:', err);
        }
    }
};