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
    priority: {
        type: String,
        required: false
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
    recurringPattern: {
        type: String,
        required: false
    },
    recurringStartDate: {
        type: Date,
        required: false,
        default: null
    },
    recurringEndDate: {
        type: Date,
        required: false,
        default: null
    },
    remindMe: {
        type: Boolean,
        required: false,
        default: false
    },
    reminderDate: {
        type: Date,
        required: false,
        default: null
    },
    assignedTo: {
        type: String,
        required: false
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
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