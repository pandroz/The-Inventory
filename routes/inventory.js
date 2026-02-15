const path = require('path');

const express = require('express');

const inventoryController = require('../controllers/inventory');
const isAuth = require('../middleware/isAuth');
const { csrfProtection } = require('../middleware/csrf');

const router = express.Router();

// GET
router.get('/', isAuth, inventoryController.getInvetory);

router.get('/edit-item/:itemId', isAuth, inventoryController.getEditItemPage);



// POST
router.post('/add-item', isAuth, csrfProtection, inventoryController.postAddItem);

router.post('/delete-item', isAuth, csrfProtection, inventoryController.postDeleteItem);

router.post('/edit-item', isAuth, csrfProtection, inventoryController.postEditItem);

router.post('/edit-quantity', isAuth, csrfProtection, inventoryController.postEditQuantity);


module.exports = router;

