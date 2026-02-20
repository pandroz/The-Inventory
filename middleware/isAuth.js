module.exports = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    } else 
        next();
}