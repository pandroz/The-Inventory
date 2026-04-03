const { generateToken } = require('../../middleware/csrf');
const { google } = require('googleapis');
const oauth2Client = require('../../middleware/googleAuth');
const User = require('../../models/user');

const calendarService = require('../../services/googleCalendar');

exports.getCalendar = (req, res, next) => {
    const csrfToken = generateToken(req, res);
    res.render('social/calendar/calendar', {
        "pageTitle": "Calendar - Pandro's Home",
        "path": "/calendar",
        "errorMessage": req.flash("error"),
        "user": req.user,
        "csrfToken": csrfToken
    })
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
    console.log('Google callback received with code:', req.query.code);
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);
    // Save tokens to your DB for this user
    await User.saveTokens(req.user._id, tokens);
    res.redirect('/calendar');
};