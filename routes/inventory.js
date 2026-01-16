const path = require('path');

const express = require('express');

const inventoryController = require('../controllers/inventory');

const router = express.Router();

// GET
router.get('/', inventoryController.getInvetory);



// POST
router.post('/', inventoryController.postAddItem);

router.post('/deleteItem', inventoryController.postDeleteItem);

module.exports = router;

