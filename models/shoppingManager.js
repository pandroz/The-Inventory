const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const shoppingListSchema = new Schema({
    itemName: {
        type: String,
        required: true
    },
    itemQty: {
        type: Number,
        required: true
    },
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    forceBuy: {
        type: Boolean,
        required: false,
        default: false
    },
    isBought: {
        type: Boolean,
        required: false,
        default: false
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: false,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: false
    }
});

module.exports = mongoose.model('shoppingList', shoppingListSchema);