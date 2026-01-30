const { update } = require('lodash');
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
    createdAt: {
        type: Date,
        required: false
    },
    updatedAt: {
        type: Date,
        required: false
    }
});

module.exports = mongoose.model('shoppingList', shoppingListSchema);