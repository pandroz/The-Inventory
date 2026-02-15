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
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next(err);
});

module.exports = router;