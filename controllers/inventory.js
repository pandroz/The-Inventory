const Item = require('../models/item');

// GET
exports.getInvetory = (req, res, next) => {
    Item.find()
        .then(items => {
            res.render('inventory/inventory', {
                pageTitle: 'Dispensa di Ale',
                path: '/inventory',
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
                path: '/inventory/edit-item',
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
        qty: req.body.qty,
        price: req.body.price,
        imageUrl: req.body.imageUrl
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
    })
        .then(result => {
            console.log('Deleted item', result);
            res.redirect('/inventory');
        }).catch(err => {
            console.log('Error deleting item', err);
        });
}


exports.postEditItem = (req, res, next) => {
    const id = req.body.itemId;
    const name = req.body.name;
    const qty = req.body.qty;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;

    Item.find({
        _id: id
    }).then(item => {
        item.name = name;
        item.qty = qty;
        item.price = price;
        item.imageUrl = imageUrl;
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
    const qty = req.body.qty;

    Item.updateOne({
        _id: id
    }, {
        $set: {
            qty: qty
        }
    })
        .then(result => {
            console.log('Updated item', result);
            res.redirect('/inventory');
        }).catch(err => {
            console.log('Error updating item', err);
        });

}