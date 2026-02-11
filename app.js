const path = require('path');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const tgBot = require('./util/telegramBot');


const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const inventoryRoutes = require('./routes/inventory');
const todoRoutes = require('./routes/todo');
const shoppingManagerRoutes = require('./routes/shoppingManager');
const apiRoutes = require('./routes/api');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/inventory', inventoryRoutes);
app.use('/todo', todoRoutes);
app.use('/shopping-manager', shoppingManagerRoutes);
app.use('/api', apiRoutes);


app.use(inventoryRoutes);
app.use(todoRoutes);

app.use((req, res, next) => {
    res.status(404).render('error/error', {
        pageTitle: 'Page Not Found', path: 'error'
    });
})


console.log('Connecting to DB...')
mongoose.connect(`mongodb+srv://${process.env.APPUSERNAME}:${process.env.APPPWD}@inventario-spesa.ru11fas.mongodb.net/${process.env.DBNAME}?appName=inventario-spesa`)
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