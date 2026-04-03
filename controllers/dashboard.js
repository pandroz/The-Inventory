
const { generateToken } = require('../middleware/csrf');

exports.getDashboard = (req, res, next) => {
    const csrfToken = generateToken(req, res);

    res.render('dashboard/dashboard', {
        pageTitle: 'Dashboard',
        path: '/dashboard',
        user: req.user,
        csrfToken: csrfToken,
    });
}