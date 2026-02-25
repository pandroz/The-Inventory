const express = require('express');
const router = express.Router();
// const socialController = require('../controllers/social');
const calendarController = require('../controllers/social/calendar');

// GET
router.get('/calendar', calendarController.getCalendar);



module.exports = router;
