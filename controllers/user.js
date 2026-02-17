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
                telegramUserError: req.flash('telegramUserError'),
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

    let tgUser = await TgUser.findOne({
        username: telegramUsername
    });

    User.findById(req.session.userId)
        .then(user => {

            if (user) {
                if (tgUser)
                    req.body.telegramId = tgUser ? tgUser._id : null;
                else
                    req.flash('telegramUserError', 'Il tuo utente Telegram non si è ancora registrato sul bot. Per favore, invia il comando /start al bot @pandroHomeBot per registrarti prima di collegare il tuo account.');

                user.updateUser(req.body);
            }


            res.redirect('/profile');
        })
        .catch(err => console.log(err));
};