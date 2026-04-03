const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/isAuth');

const calendarController = require('../controllers/social/calendar');

// GET
router.get('/', isAuth, calendarController.getCalendar);

router.get('/google', isAuth, calendarController.redirectToGoogle);

router.get('/callback', isAuth, calendarController.handleGoogleCallback);


module.exports = router;
