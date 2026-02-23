const { Agenda } = require('agenda');
const { MongoBackend } = require('@agendajs/mongo-backend');
const mongoose = require('mongoose');

var agenda;

exports.initAgenda = () => {
    agenda = new Agenda({
        backend: new MongoBackend({
            // address: process.env.MONGODB_URI + '&directConnection=true',
            // Or reuse an existing Mongoose connection:
            mongo: mongoose.connection.db,
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
            collection: 'agendaJobs', // optional, this is the default
        }),
        processEvery: '5 seconds',
        maxConcurrency: 20,
    });

    return agenda;
}

exports.getAgenda = () => {
    if (!agenda) {
        throw new Error('Agenda not initialized. Call initAgenda() first.');
    }
    return agenda;
}