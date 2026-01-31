const ShoppingManager = require('../models/shoppingManager');

exports.getShoppingList = (req, res, next) => {
    ShoppingManager.find()
        .sort({ createdAt: -1 })
        .then(result => {
            res.render('shoppingManager/shoppingManager', {
                pageTitle: 'Shopping Manager',
                path: '/shopping-manager',
                searchType: 'shoppingManager',
                shoppingList: result
            });
        })
};

exports.addItem = (req, res, next) => {
    const item = new ShoppingManager({
        itemName: req.body.itemName,
        itemQty: req.body.itemQty,
        createdAt: new Date()
    });

    item.save()
        .then(result => {
            console.log('Saved item', result);
            res.redirect('/shopping-manager');
        }).catch(err => {
            console.log('Error saving item', err);
        });
}

exports.deleteItem = (req, res, next) => {
    const id = req.body.itemId;
    console.log('id is ==> ', id);
    ShoppingManager.deleteOne({
        _id: id
    }).then(result => {
        console.log('Deleted item', result);
        res.status(200).json({ message: 'Item deleted successfully' });
    }).catch(err => {
        res.status(200).json({ message: 'Error deleting item: ' + err, itemName: result.name });
        console.log('Error deleting item', err);
    });
}

exports.editItemQty = (req, res, next) => {
    const itemId = req.body.itemId;
    const quantity = req.body.quantity;

    ShoppingManager.findOne({
        _id: itemId
    })
    .then(item => {
        item.itemQty = quantity;
        return item.save()
    })
    .then(result => {
        console.log('Updated item', result);
        res.status(200).json({ message: 'Item updated successfully', qty: result.qty });
    })
    .catch(err => {
        res.status(500).json({ message: 'Error updating item: ' + err });
        console.log('Error updating item', err);
    });
    
}