const express = require('express');
const router = express.Router();

const apiController = require('../controllers/api');

router.get('/search-images', apiController.searchImagesParse);


exports = module.exports = router;
