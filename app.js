const path = require('path');

process.loadEnvFile('./.env');

const express = require('express');
const bodyParser = require('body-parser');


const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const inventoryRoutes = require('./routes/inventory');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/inventory', inventoryRoutes);



console.log('Connecting to DB...')
mongoose.connect(`mongodb+srv://${process.env.APPUSERNAME}:${process.env.APPPWD}@inventario-spesa.ru11fas.mongodb.net/${process.env.DBNAME}?appName=inventario-spesa`)

.then(client => {
    console.log('Connected to DB');
    app.listen(3000);
})
.catch(err => {
    console.log('Error connecting to DB', err);
})