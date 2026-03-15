const express = require('express');

const authController = require('../controllers/auth');
const isAuth = require('../middleware/isAuth');
const csrfModule = require('../middleware/csrf');

const router = express.Router();

// GETs
router.get('/', isAuth, (req, res, next) => {
    res.redirect('/inventory');
});

router.get('/login', authController.getLogin);

router.get('/register', authController.getRegister);


// POSTs
router.post('/login', csrfModule.csrfProtection, authController.postLogin);

router.post('/logout', isAuth, csrfModule.csrfProtection, authController.postLogout);

router.post('/register', csrfModule.csrfProtection, authController.postRegister);

router.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return req.session.destroy(err => {
            try {
                req.flash('sessionExpiredError', 'Sessione scaduta. Per favore, effettua nuovamente il login.');

            } catch (e) {
                console.log(e);
            } finally {
                return res.redirect(200, '/login');

            }
        });
    };
    next(err);
});

module.exports = router;