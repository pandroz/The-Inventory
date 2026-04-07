const { generateToken } = require('../../middleware/csrf');
const { google } = require('googleapis');
const moment = require('moment');
const { oauth2Client } = require('../../middleware/googleAuth');
const calendarService = require('../../services/googleCalendar');

const User = require('../../models/user');
const Event = require('../../models/event');

const _ = require('lodash');


exports.getCalendar = async (req, res, next) => {
    const csrfToken = generateToken(req, res);

    let events = [];
    if (req.user.googleTokens?.access_token) {
        try {
            events = await calendarService.listEvents(req.user);
        } catch (error) {
            if (_.startsWith(error.message, 'No refresh token is set')) {
                console.error('Sync token expired, need to clear and re-authenticate');
                req.user.googleTokens = null;
                await User.clearTokens(req.user._id);
            } else {
                console.error('[getCalendar] Error fetching calendar events:', error);
            }
        }
    }

    res.render('social/calendar/calendar', {
        "pageTitle": "Calendar - Pandro's Home",
        "path": "/calendar",
        "errorMessage": req.flash("error"),
        "user": req.user,
        "csrfToken": csrfToken,
        "googleConnected": !!req.user.googleTokens?.access_token,
        "events": events.data?.items || [],
        _: _
    })
};




// Event CRUD operations
exports.createEvent = async (req, res, next) => {
    try {
        // 1. Push to Google Calendar first to get back the googleEventId
        let googleEventData = {
            summary: req.body.title,
            description: req.body.description,
            location: req.body.location,
            start: req.body.start,
            end: req.body.end
        };

        const response = await calendarService.createEvent(req.user, googleEventData);

        // 2. Save to MongoDB using the Google event ID from the response
        const event = await Event.create({
            userId: req.user.id,
            googleEventId: response.data.id,
            title: req.body.title,
            description: req.body.description,
            location: req.body.location,
            start: req.body.start,
            end: req.body.end,
            isAllDay: req.body.isAllDay,
            source: 'app',
            rawGoogleEvent: response.data,
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error creating event:', error.message);
        next(error);
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        // 1. Find in MongoDB to get the googleEventId
        const event = await Event.findOne({ googleEventId: req.params.id, userId: req.user.id });

        // 2. Update on Google Calendar
        const response = await calendarService.updateEvent(req.user, req.params.id, {
            summary: req.body.title,
            description: req.body.description,
            location: req.body.location,
            start: req.body.start,
            end: req.body.end,
        });

        // 3. Update in MongoDB
        if (!!event) {
            const updated = await Event.findByIdAndUpdate(
                req.params.id,
                {
                    title: req.body.title,
                    description: req.body.description,
                    location: req.body.location,
                    start: req.body.start,
                    end: req.body.end,
                    isAllDay: req.body.isAllDay,
                    rawGoogleEvent: response.data,
                },
                { new: true }
            );
        }

        res.json(response.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        // 1. Find in MongoDB to get the googleEventId
        const event = await Event.findOne({
            googleEventId: req.params.id,
            userId: req.user.id
        });

        // 2. Delete from Google Calendar
        await calendarService.deleteEvent(req.user, req.params.id);

        // 3. Delete from MongoDB
        if (!!event) await event.deleteEvent();

        res.json({ success: true });

    } catch (error) {
        console.error(error);
        next(error);
    }
};









// ── Google OAuth Flow ────────────────────────────────────────────────────────

exports.disconnectGoogleCalendar = async (req, res, next) => {
    try {
        await User.clearTokens(req.user._id);
        res.redirect('/calendar');
    } catch (error) {
        console.error('Error disconnecting Google Calendar:', error);
        res.redirect('/calendar');
    }
};


exports.redirectToGoogle = (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
    });
    res.redirect(url);
};

// Handle the callback and store tokens
exports.handleGoogleCallback = async (req, res, next) => {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);
    // Save tokens to your DB for this user
    await User.saveTokens(req.user._id, tokens);
    res.redirect('/calendar');
};
