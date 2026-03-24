const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: false
    },
    qty: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: false
    },
    lowStockAlert: {
        type: Number,
        required: false,
        default: 0
    },
    buyPriority: {
        type: Number,
        required: false,
        default: 0
    },
    storageLocation: {
        type: String,
        required: false
    },
    expirationDate: {
        type: Date,
        required: false
    },
    price: {
        type: Number,
        required: false,
        default: 0
    },
    preferredSupplier: {
        type: String,
        required: false
    },
    notes: {
        type: String,
        required: false
    },
    imageUrl: {
        type: String,
        required: false,
        default: ''
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    barcode: {
        type: String,
        required: false
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