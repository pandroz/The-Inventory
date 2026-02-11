const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tgUserSchema = new Schema({
    telegramId: {
        type: Number,
        required: true,
        unique: true
    },
    username: String,
    firstName: String,
    lastName: String,
    isActive: {
        type: Boolean,
        default: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TgUser', tgUserSchema);