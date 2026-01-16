const item = require('../models/item');
const Item = require('../models/item');

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


exports.getInvetory = (req, res, next) => {
    item.find()
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