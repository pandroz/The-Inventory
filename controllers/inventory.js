const Item = require('../models/item');

// GET
exports.getInvetory = (req, res, next) => {
    Item.find()
        .sort({ createdAt: -1 })
        .then(items => {
            res.render('inventory/inventory', {
                pageTitle: 'Dispensa',
                path: '/inventory',
                searchType: 'item',
                itemAmount: items.length,
                items: items
            });
        }).catch(err => {
            console.log('Error fetching items', err);
        });
}

exports.getEditItemPage = (req, res, next) => {
    const id = req.params.itemId;
    Item.findById({
        _id: id
    })
        .then(item => {
            res.render('inventory/edit-item', {
                pageTitle: 'Edit Item',
                path: '/inventory',
                item: item
            });
        }).catch(err => {
            console.log('Error fetching item', err);
        });
}





// POST
exports.postAddItem = (req, res, next) => {
    const item = new Item({
        name: req.body.name,
        category: req.body.category,
        qty: req.body.qty,
        unit: req.body.unit,
        lowStockAlert: req.body.lowStockAlert,
        buyPriority: req.body.buyPriority,
        storageLocation: req.body.storageLocation,
        expirationDate: req.body.expirationDate,
        price: req.body.price,
        preferredSupplier: req.body.preferredSupplier,
        notes: req.body.notes,
        imageUrl: req.body.selectedImage,
        createdAt: new Date()
    });

    item.save()
        .then(result => {
            console.log('Saved item', result);
            res.redirect('/inventory');
        }).catch(err => {
            console.log('Error saving item', err);
        });
}


exports.postDeleteItem = (req, res, next) => {
    const id = req.body.itemId;
    Item.deleteOne({
        _id: id
    }).then(result => {
        console.log('Deleted item', result);
        // res.redirect('/inventory');
        res.status(200).json({ message: 'Item deleted successfully' });
    }).catch(err => {
        console.log('Error deleting item', err);
    });
}


exports.postEditItem = (req, res, next) => {
    const id = req.body.itemId;

    Item.findById({
        _id: id
    }).then(item => {
        item.name = req.body.name;
        item.category = req.body.category;
        item.qty = req.body.qty;
        item.unit = req.body.unit;
        item.lowStockAlert = req.body.lowStockAlert;
        item.buyPriority = req.body.buyPriority;
        item.storageLocation = req.body.storageLocation;
        item.expirationDate = req.body.expirationDate;
        item.price = req.body.price;
        item.preferredSupplier = req.body.preferredSupplier;
        item.notes = req.body.notes;
        item.imageUrl = req.body.imageUrl;
        item.updated = new Date();
        return item.save();
    }).then(result => {
        console.log('Updated item', result);
        res.redirect('/inventory');
    }).catch(err => {
        console.log('Error updating item', err);
    });
}


exports.postEditQuantity = (req, res, next) => {
    const id = req.body.itemId;
    const newQty = req.body.newQty;

    Item.findById({
        _id: id
    }).then(item => {
        item.qty = newQty;
        return item.save();
    }).then(result => {
        console.log('Updated item', result);
        res.status(200).json({ message: 'Item updated successfully' });
    }).catch(err => {
        res.status(500).json({ message: 'Error updating item: ' + err, itemName: result.name });
        console.log('Error updating item', err);
    });
}