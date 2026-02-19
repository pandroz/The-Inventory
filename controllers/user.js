const User = require('../models/user');
const UserPreferences = require('../models/userPreferences');
const Item = require('../models/item');
const Todo = require('../models/todo');
const ShoppingList = require('../models/shoppingManager');
const TgUser = require('../models/tgUser');
const argon2 = require('argon2');

const { generateToken } = require('../middleware/csrf');

exports.getProfile = (req, res, next) => {
    User.findById(req.session.userId)
        .populate('telegramId')
        .populate('userPreferences')
        .then(async user => {
            if (!user) {
                return res.redirect('/login');
            }

            if (!user.userPreferences) {
                const userPreferences = new UserPreferences({
                    userId: user._id
                });
                await userPreferences.save();
                user.userPreferences = userPreferences._id;
                await user.save();
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
    const telegramUsername = req.body.telegramUsername;

    let tgUser = await TgUser.findOne({
        username: telegramUsername
    });

    if (!tgUser) {
        req.flash('telegramUserError', `Non è stato possibile trovare un utente Telegram con username @${telegramUsername}. Assicurati di aver inviato il comando /start al bot @pandroHomeBot con lo stesso username prima di collegare il tuo account.`);
        res.redirect('/profile');
    } else {
        try {
            req.body.telegramId = tgUser ? tgUser._id : null;
            req.user.updateUser(req.body);
        } catch (err) {
            console.log('Error updating user profile:', err);
            req.flash('telegramUserError', 'Si è verificato un errore durante l\'aggiornamento del profilo. Riprova più tardi.');
        }
        
        res.redirect('/profile');
    }
};

exports.editPreferences = (req, res, next) => {
    UserPreferences.findById(req.user.userPreferences)
        .then(userPref => {
            if (userPref) {
                userPref.updatePreferences(req.body);
            }
            res.redirect('/profile');
        })
        .catch(err => console.log(err));
}

exports.postChangePassword = (req, res, next) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        req.flash('passwordError', 'Per favore, compila tutti i campi.');
        return res.redirect('/profile');
    }

    if (newPassword.length < 8) {
        req.flash('passwordError', 'La nuova password deve essere di almeno 8 caratteri.');
        return res.redirect('/profile');
    }

    if (newPassword !== confirmNewPassword) {
        req.flash('passwordError', 'Le password non corrispondono.');
        return res.redirect('/profile');
    }

    User.findById(req.session.userId)
        .then(user => {
            if (!user) {
                return res.redirect('/login');
            }

            argon2.verify(user.password, currentPassword).then(isVerified => {
                if (!isVerified) {
                    req.flash('passwordError', 'Password errata.');
                    return res.redirect('/profile');
                } else {
                    argon2.hash(newPassword).then(hashedPassword => {
                        user.password = hashedPassword;
                        user.save();
                        res.redirect('/profile');
                    });
                }
            });
        })
        .catch(err => console.log(err));
}