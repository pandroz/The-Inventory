const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        required: false,
        default: 0
    },
    imageUrl: {
        type: String,
        required: false,
        default: ''
    },
    updated: {
        type: Date,
        required: false
    },
    createdAt: {
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = mongoose.model('Item', itemSchema);