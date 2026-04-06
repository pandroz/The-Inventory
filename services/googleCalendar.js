const { google } = require('googleapis');
const { getAuthenticatedClient } = require('../middleware/googleAuth');
const User = require('../models/user');

const getCalendarClient = async (user) => {
    const { client, newTokens } = await getAuthenticatedClient(user.googleTokens);

    // If tokens were refreshed, persist them so the next call doesn't fail too
    if (newTokens) {
        await User.saveTokens(user.id, newTokens);
    }

    return google.calendar({ version: 'v3', auth: client });
}



// CREATE EVENT
exports.createEvent = async (user, eventData) => {
    const calendar = await getCalendarClient(user);
    return await calendar.events.insert({ calendarId: 'combi.alessandro.a@gmail.com', requestBody: eventData });
};



// UPDATE EVENT
exports.updateEvent = async (user, eventId, eventData) => {
    const calendar = await getCalendarClient(user);
    return await calendar.events.update({ calendarId: 'combi.alessandro.a@gmail.com', eventId, requestBody: eventData });
};



// DELETE EVENT
exports.deleteEvent = async (user, eventId) => {
    const calendar = await getCalendarClient(user);
    return await calendar.events.delete({ calendarId: 'combi.alessandro.a@gmail.com', eventId });
};



// LIST EVENTS
exports.listEvents = async (user, syncToken = null) => {
    const calendar = await getCalendarClient(user);

    const params = { calendarId: 'combi.alessandro.a@gmail.com', singleEvents: true, orderBy: 'startTime' };

    if (syncToken) params.syncToken = syncToken;

    let calendarList = await calendar.events.list(params)
    return calendarList;
};