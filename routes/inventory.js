const path = require('path');

const express = require('express');

const inventoryController = require('../controllers/inventory');

const router = express.Router();

// GET
router.get('/', inventoryController.getInvetory);

router.get('/edit-item/:itemId', inventoryController.getEditItemPage);



// POST
router.post('/', inventoryController.postAddItem);

router.post('/deleteItem', inventoryController.postDeleteItem);

router.post('/edit-item', inventoryController.postEditItem);

router.post('/edit-quantity', inventoryController.postEditQuantity);


module.exports = router;

