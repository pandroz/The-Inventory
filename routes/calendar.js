const express = require('express');
const router = express.Router();

const isAuth = require('../middleware/isAuth');

const calendarController = require('../controllers/social/calendar');

// GET
router.get('/', isAuth, calendarController.getCalendar);

router.get('/google', isAuth, calendarController.redirectToGoogle);

router.get('/callback', isAuth, calendarController.handleGoogleCallback);


// POST, PUT, DELETE for events
router.post('/events', isAuth, calendarController.createEvent);

router.put('/events/:id', isAuth, calendarController.updateEvent);

router.delete('/events/:id', isAuth, calendarController.deleteEvent);


router.post('/google/disconnect', isAuth, calendarController.disconnectGoogleCalendar);

module.exports = router;
