// LIBRARIES
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDbSessionStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
require('dotenv').config();

// MODELS
const User = require('./models/user');
const tgBot = require('./services/telegramBot');

// JOBS
const { initJobs, stopJobs, getAgenda } = require('./jobs');

const app = express();
const store = new MongoDbSessionStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions'
})

const SESSION_TIMEOUT_MS = 1000 * 60 * 60; // 1 hour

app.set('view engine', 'ejs');
app.set('views', 'views');

// ROUTES
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const todoRoutes = require('./routes/todo');
const shoppingManagerRoutes = require('./routes/shoppingManager');
const apiRoutes = require('./routes/api');
const errorRoutes = require('./routes/error');
const userRoutes = require('./routes/user');
const socialRoutes = require('./routes/social');

// MIDDLEWARE
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: SESSION_TIMEOUT_MS
    },
    rolling: true,
    store: store
}))
app.use(flash());

// Session expiration checker
app.use((req, res, next) => {
    // Skip for public routes
    if (req.path.startsWith('/login') ||
        req.path.startsWith('/register') ||
        req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        return next();
    }

    // Check if session exists and has a user
    if (req.session && req.session.user) {
        const now = Date.now();
        const sessionExpiry = new Date(req.session.cookie._expires).getTime();

        console.log('Current time:', now);
        console.log('Session expires at:', sessionExpiry);
        console.log('Time remaining:', (sessionExpiry - now) / 1000, 'seconds');

        // Check if session has expired
        if (now > sessionExpiry) {
            console.log('Session expired - logging out user');
            req.session.destroy((err) => {
                if (err) console.log('Session destroy error:', err);
                return res.redirect('/logout');
            });
            return;
        }
    }
    next();
});


app.use((req, res, next) => {
    if (!req.session.userId) {
        return next();
    }
    User.findById(req.session.userId)
        .then(user => {
            user.setActiveStatus(true);
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})


app.use('/inventory', inventoryRoutes);
app.use('/todo', todoRoutes);
app.use('/shopping-manager', shoppingManagerRoutes);
app.use('/profile', userRoutes);
app.use('/api', apiRoutes);
app.use('/social', socialRoutes);
app.use(authRoutes);
app.use(errorRoutes);


// CONNECT TO DB AND START AGENDA
console.log('Connecting to DB...')
mongoose.connect(process.env.MONGO_URI)
    .then(async client => {
        console.log('Connected to DB');
        await initJobs();
    })
    .catch(err => {
        console.log('Error connecting to DB', err);
    })



// Telegram bot    
console.log('Starting Telegram bot...')
tgBot.launch()
    .then(() => console.log('Telegram bot started'))
    .catch(err => console.error('Bot launch error:', err));



process.on('SIGTERM', async () => {
    await stopJobs();
    await mongoose.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await stopJobs();
    await mongoose.disconnect();
    process.exit(0);
});


app.listen(3000);