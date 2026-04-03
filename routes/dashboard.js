const express = require('express');

const dashboardController = require('../controllers/dashboard');
const isAuth = require('../middleware/isAuth');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

// GET
router.get('/', isAuth, dashboardController.getDashboard);


// POST



module.exports = router;

