const User = require('../models/user');
const Item = require('../models/item');
const Todo = require('../models/todo');
const ShoppingList = require('../models/shoppingManager');
const tgUser = require('../models/tgUser');

const { generateToken } = require('../middleware/csrf');

exports.getProfile = (req, res, next) => {
    User.findById(req.session.userId)
        .then(user => {
            if (!user) {
                return res.redirect('/login');
            }
            res.render('user/profile', {
                csrfToken: generateToken(req, res),
                pageTitle: "Profile - Pandro's Home",
                path: '/profile',
                user: req.user,
                stats: {
                    itemAmount: Item.countDocuments({ userId: req.user._id }),
                    todoAmount: Todo.countDocuments({ userId: req.user._id }),
                    shoppingListAmount: ShoppingList.countDocuments({ userId: req.user._id })
                }
            });
        })
        .catch(err => console.log(err));
};

exports.editProfile = (req, res, next) => {
    const { name, email, phoneNumber, telegramId, userBio } = req.body;
    

    User.findById(req.session.userId)
        .then(user => {
            user.name = name;
            user.email = email;
            user.phoneNumber = phoneNumber;
            user.telegramId = telegramId;
            user.userBio = userBio;
            user.save();
            res.redirect('/profile');
        })
        .catch(err => console.log(err));
};