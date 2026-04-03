const { google } = require('googleapis');
const oauth2Client = require('../middleware/googleAuth');

const getCalendarClient = (tokens) => {
    oauth2Client.setCredentials(tokens);
    return google.calendar({ version: 'v3', auth: oauth2Client });
};

exports.createEvent = async (tokens, eventData) => {
    const calendar = getCalendarClient(tokens);
    return calendar.events.insert({ calendarId: 'primary', requestBody: eventData });
};

exports.updateEvent = async (tokens, eventId, eventData) => {
    const calendar = getCalendarClient(tokens);
    return calendar.events.update({ calendarId: 'primary', eventId, requestBody: eventData });
};

exports.deleteEvent = async (tokens, eventId) => {
    const calendar = getCalendarClient(tokens);
    return calendar.events.delete({ calendarId: 'primary', eventId });
};

exports.listEvents = async (tokens, syncToken = null) => {
    const calendar = getCalendarClient(tokens);
    const params = { calendarId: 'primary', singleEvents: true };
    if (syncToken) params.syncToken = syncToken;
    return calendar.events.list(params);
};