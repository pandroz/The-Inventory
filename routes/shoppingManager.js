const express = require('express');

const shoppingManagerController = require('../controllers/shoppingManager');
const isAuth = require('../middleware/isAuth');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

router.get('/', isAuth, csrfProtection, shoppingManagerController.getShoppingList);

router.get('/upsert-list', isAuth, csrfProtection, shoppingManagerController.upsertList);

router.post('/add-item', isAuth, csrfProtection, shoppingManagerController.addItem);

router.post('/delete-item', isAuth, csrfProtection, shoppingManagerController.deleteItem);

router.post('/update-item', isAuth, csrfProtection, shoppingManagerController.updateItem);


module.exports = router;