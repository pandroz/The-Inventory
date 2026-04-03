const { google } = require('googleapis');
const oauth2Client = require('../config/googleAuth');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = process.env.PUBLIC_BASE_URL; // e.g. https://a1b2-c3d4.ngrok-free.app

exports.registerWatchChannel = async (tokens) => {
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const channelId = uuidv4(); // unique ID for this channel

    const response = await calendar.events.watch({
        calendarId: 'primary',
        requestBody: {
            id: channelId,
            type: 'web_hook',
            address: `${BASE_URL}/webhooks/calendar`,
            token: process.env.WEBHOOK_SECRET, // optional, but recommended for validation
        },
    });

    // Store this — you'll need it to stop or renew the channel
    return {
        channelId,
        resourceId: response.data.resourceId,
        expiration: response.data.expiration, // Unix timestamp in ms
    };
};

exports.stopWatchChannel = async (tokens, channelId, resourceId) => {
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.channels.stop({
        requestBody: { id: channelId, resourceId },
    });
};