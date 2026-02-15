const express = require('express');

const authController = require('../controllers/auth');
const isAuth = require('../middleware/isAuth');
const csrfModule = require('../middleware/csrf');

const router = express.Router();

// Render error page
router.use((req, res, next) => {
    res.status(404).render('error/error', {
        csrfToken: csrfModule.generateToken(req, res),
        pageTitle: 'Page Not Found',
        path: 'error',
        user: req.user
    });
});

module.exports = router;