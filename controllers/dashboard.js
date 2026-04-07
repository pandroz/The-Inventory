const { generateToken } = require('../middleware/csrf');
const Item = require('../models/item');
const ToDo = require('../models/todo');
const ShoppingManager = require('../models/shoppingManager');
const User = require('../models/user');

exports.getDashboard = async (req, res, next) => {
    const csrfToken = generateToken(req, res);

    const lowStockItems = await Item.find({
        user: req.user._id,
        $expr: {
            $lt: ["$qty", "$lowStockAlert"]
        }
    }).sort({ buyPriority: -1, expirationDate: 1 }).limit(5);

    const expiringToDos = await ToDo.find({
        user: req.user._id,
        dueDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // Due in the next 7 days
    }).sort({ priority: -1, dueDate: 1 }).limit(5);

    const shoppingList = await ShoppingManager.find({ user: req.user._id }).populate('item').limit(5);

    res.render('dashboard/dashboard', {
        pageTitle: 'Dashboard',
        path: '/dashboard',
        user: req.user,
        csrfToken: csrfToken,
        lowStockItems: lowStockItems,
        expiringToDos: expiringToDos,
        shoppingList: shoppingList
    });
}