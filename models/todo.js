const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const todoSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    addDescr: {
        type: String,
        required: false
    },
    done: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        required: false
    },
    completeBy: {
        type: Date,
        required: false,
        default: null
    },
    completedOn: {
        type: Date,
        required: false,
        default: null
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updated: {
        type: Date,
        required: false,
        default: null
    }
});

module.exports = mongoose.model('Todo', todoSchema);