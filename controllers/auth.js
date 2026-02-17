const argon2 = require('argon2');
const { generateToken } = require('../middleware/csrf');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    const csrfToken = generateToken(req, res);
    res.render('auth/login', {
        pageTitle: "Login - Pandro's Home",
        path: '/login',
        csrfToken: csrfToken,
        errorMessage: req.flash('error'),
        sessionExpiredError: req.flash('sessionExpiredError')
    });
};

exports.getRegister = (req, res, next) => {
    const csrfToken = generateToken(req, res);

    res.render('auth/register', {
        pageTitle: "Register - Pandro's Home",
        path: '/register',
        csrfToken: csrfToken,
        errorMessage: req.flash('error')
    });
};

exports.postLogin = (req, res, next) => {
    User.findOne({
        $or: [
            { username: req.body.username_or_email },
            { email: req.body.username_or_email }
        ]
    }).then(user => {
        if (!user) {
            req.flash('error', 'Username/email o password errati');
            res.redirect('/login');
        } else {
            argon2.verify(user.password, req.body.password).then(isVerified => {
                if (!isVerified) {
                    req.flash('error', 'Username/email o password errati');
                    return res.redirect('/login');
                } else {
                    req.session.isLoggedIn = true;
                    req.session.userId = user._id.toString();
                    return req.session.save(err => {
                        if (err)
                            console.log('Error saving session', err);
                        else
                            res.redirect('/inventory');
                    });
                }
            });
        }
    });
}

exports.postLogout = (req, res, next) => {
    User.findById(req.session.userId)
        .then(user => {
            if (user) {
                user.setActiveStatus(false);
            }
        })
        .catch(err => console.log('Error setting user inactive on logout', err));

    req.session.destroy(err => {
        if (err) console.log('Error destroying session on logout', err);
        res.redirect('/login');
    });
}


exports.postRegister = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        email: email
    }).then(user => {
        if (user) {
            req.flash('error', 'Un utente con questa email è già esistente');
            return res.redirect('/register');
        } else {
            argon2.hash(password).then(hashedPassword => {
                const user = new User({
                    username: username,
                    email: email,
                    password: hashedPassword
                });
                user.save();
                return res.redirect('/login');
            }).catch(err => {
                console.log('(postRegister) Error hashing password', err);
                res.redirect(500, '/register');
            })
        }
    }).catch(err => {
        console.log(err);
        res.redirect('/register');
    });
}