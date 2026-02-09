const express = require('express');

const shoppingManagerController = require('../controllers/shoppingManager');

const router = express.Router();

router.get('/', shoppingManagerController.getShoppingList);

router.get('/upsert-list', shoppingManagerController.upsertList);

router.post('/add-item', shoppingManagerController.addItem);

router.post('/delete-item', shoppingManagerController.deleteItem);

router.post('/edit-qty', shoppingManagerController.editItemQty);


module.exports = router;