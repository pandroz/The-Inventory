const ShoppingManager = require('../models/shoppingManager');
const Item = require('../models/item');
const _ = require('lodash');

exports.getShoppingList = (req, res, next) => {
    ShoppingManager.find()
        .sort({ createdAt: -1 })
        .populate('item')
        .then(result => {

            // Remove items that don't need to be bought
            let toRemove = [];
            _.each(result, (shopList, i) => {
                let qtyToBuy = (shopList.item.lowStockAlert || 0) - (shopList.item.qty || 0);
                
                if (qtyToBuy > 0) {
                    shopList.itemQty = qtyToBuy;
                } else if (qtyToBuy <= 0) {
                    toRemove.push(shopList.item._id);
                    ShoppingManager.deleteOne({ _id: shopList._id })
                    .then(result => {
                        console.log('Deleted item', result);
                    }).catch(err => {
                        console.log('Error deleting item', err);
                    });
                }
            });

            result = _.filter(result, list => !_.includes(toRemove, list.item._id));

            res.render('shoppingManager/shoppingManager', {
                pageTitle: 'Shopping Manager',
                path: '/shopping-manager',
                searchType: 'shoppingManager',
                shoppingList: result
            });
        })
};

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


exports.upsertList = (req, res, next) => {
    console.log('upsertList');
    Item.aggregate([
        {
            "$match": {
                "$expr": {
                    "$or": [
                        {
                            "$gte": [new Date(), "$expirationDate"]
                        },
                        {
                            "$gte": ["$lowStockAlert", "$qty"]
                        }
                    ]
                }
            }
        },
        {
            "$project": {
                "_id": 1,
                "name": 1,
                "lowStockAlert": 1,
                "qty": 1
            }
        },
        {
            "$lookup": {
                "from": "shoppingmanager",
                "localField": "_id",
                "foreignField": "item",
                "as": "shopList"
            }
        },
        {
            "$unwind": {
                "path": "$shopList",
                "preserveNullAndEmptyArrays": true
            }
        }
    ]).then(itemsToAdd => {
        itemsToAdd.forEach(item => {
            let qtyToBuy = (item.lowStockAlert || 0) - (item.qty || 0);
            
            if (qtyToBuy > 0 && qtyToBuy !== _.get(item, 'shopList.itemQty', 0)) {
                ShoppingManager.findOneAndUpdate({
                    item: item._id
                }, {
                    itemName: item.name,
                    itemQty: qtyToBuy,
                    updatedAt: new Date()
                }, {
                    new: true,
                    upsert: true
                }).then(result => {
                    console.log('Upserted item', result);
                }).catch(err => {
                    console.log('Error upserting item', err);
                    res.redirect('/error');
                });
            }
        });
        res.redirect('/shopping-manager');
    })
}