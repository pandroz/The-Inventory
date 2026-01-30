const express = require('express');

const shoppingManagerController = require('../controllers/shoppingManager');

const router = express.Router();

router.get('/', shoppingManagerController.getShoppingList);

router.post('/add-item', shoppingManagerController.addItem);

router.post('/delete-item', shoppingManagerController.deleteItem);


module.exports = router;