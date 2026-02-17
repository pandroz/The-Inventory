const User = require('../models/user');

module.exports = (req, res, next) => {
    if (!req.session.userId) {
        User.setActiveStatus(false);
        req.flash('sessionExpiredError', 'Sessione scaduta. Per favore, effettua nuovamente il login.');
        return res.redirect('/login');
    } else 
        next();
}