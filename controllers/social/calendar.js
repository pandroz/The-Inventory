const { generateToken } = require('../../middleware/csrf');


exports.getCalendar = (req, res, next) => {
    const csrfToken = generateToken(req, res)
    res.render('social/calendar/calendar', {
        pageTitle: "Calendar - Pandro's Home",
        path: '/calendar',
        errorMessage: req.flash('error'),
        user: req.user,
        csrfToken
    })
};