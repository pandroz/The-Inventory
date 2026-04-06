const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook');

router.post('/calendar', webhookController.handleCalendarWebhook);

module.exports = router;