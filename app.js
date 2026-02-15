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
const tgBot = require('./util/telegramBot');


const MONGODB_URI = `mongodb+srv://${process.env.APPUSERNAME}:${process.env.APPPWD}@inventario-spesa.ru11fas.mongodb.net/${process.env.DBNAME}?appName=inventario-spesa`;

const app = express();
const store = new MongoDbSessionStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

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
        maxAge: 1000 * 60 * 60 // 1 hour
    },
    store: store
}))
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.userId) {
        return next();
    }
    User.findById(req.session.userId)
        .then(user => {
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
app.use(authRoutes);
app.use(errorRoutes);


console.log('Connecting to DB...')
mongoose.connect(MONGODB_URI)
    .then(client => {
        console.log('Connected to DB');
    })
    .catch(err => {
        console.log('Error connecting to DB', err);
    })

console.log('Starting Telegram bot...')
tgBot.launch()
    .then(() => console.log('Telegram bot started'))
    .catch(err => console.error('Bot launch error:', err));

app.listen(3000);