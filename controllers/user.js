const User = require('../models/user');
const Item = require('../models/item');
const Todo = require('../models/todo');
const ShoppingList = require('../models/shoppingManager');
const TgUser = require('../models/tgUser');

const { generateToken } = require('../middleware/csrf');

exports.getProfile = (req, res, next) => {
    User.findById(req.session.userId)
        .populate('telegramId')
        .then(async user => {
            if (!user) {
                return res.redirect('/login');
            }

            res.render('user/profile', {
                csrfToken: generateToken(req, res),
                pageTitle: "Profile - Pandro's Home",
                path: '/profile',
                user: user,
                stats: {
                    itemAmount: await Item.countDocuments({ userId: req.user._id }),
                    todoAmount: await Todo.countDocuments({ userId: req.user._id }),
                    shoppingListAmount: await ShoppingList.countDocuments({ userId: req.user._id })
                }
            });
        })
        .catch(err => console.log(err));
};

exports.editProfile = async (req, res, next) => {
    const { name, email, phoneNumber, telegramUsername, userBio } = req.body;

    let tgUser = await TgUser.findOne({
        username: telegramUsername
    });
    
    console.log('edit profile', name, email, phoneNumber, telegramUsername, userBio);
    User.findById(req.session.userId)
        .then(user => {
            user.name = name;
            user.email = email;
            user.phoneNumber = phoneNumber;
            user.userBio = userBio;

            if (tgUser) {
                user.telegramId = tgUser._id;
            }

            user.save();
            res.redirect('/profile');
        })
        .catch(err => console.log(err));
};