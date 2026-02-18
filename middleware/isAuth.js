module.exports = (req, res, next) => {
    if (!req.session.userId) {
        req.flash('sessionExpiredError', 'Sessione scaduta. Per favore, effettua nuovamente il login.');
        return res.redirect('/login');
    } else 
        next();
}