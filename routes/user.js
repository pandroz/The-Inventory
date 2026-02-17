const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');
const isAuth = require('../middleware/isAuth');
const { csrfProtection } = require('../middleware/csrf');

// GET 
router.get('/', isAuth, userController.getProfile);

// POST
router.post('/edit-profile', isAuth, csrfProtection, userController.editProfile);
// router.post('/change-password', isAuth, userController.postChangePassword);
// router.post('/delete-account', isAuth, userController.postDeleteAccount);
// router.post('/update-preferences', isAuth, userController.postUpdatePreferences);

module.exports = router;