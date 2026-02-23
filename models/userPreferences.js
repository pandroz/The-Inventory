const e = require('connect-flash');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    language: {
        type: String,
        default: 'it'
    },
    telegramNotifications: {
        type: Boolean,
        default: false
    },
    emailNotifications: {
        type: Boolean,
        default: false
    },
    todoReminders: {
        type: Boolean,
        default: false
    },
    shoppingNotifications: {
        type: Boolean,
        default: false
    },
    lowStockAlerts: {
        type: Boolean,
        default: false
    },
    theme: {
        type: String,
        default: 'light'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.updatePreferences = function (preferences) {
    const { language, emailNotifications, telegramNotifications, todoReminders, shoppingNotifications, lowStockAlerts, theme } = preferences;

    this.language = language || this.language;
    this.emailNotifications = emailNotifications !== undefined ? emailNotifications === 'on' : false;
    this.telegramNotifications = telegramNotifications !== undefined ? telegramNotifications === 'on' : false;
    this.todoReminders = todoReminders !== undefined ? todoReminders === 'on' : false;
    this.shoppingNotifications = shoppingNotifications !== undefined ? shoppingNotifications === 'on' : false;
    this.lowStockAlerts = lowStockAlerts !== undefined ? lowStockAlerts === 'on' : false;
    this.theme = theme || this.theme;
    
    this.updatedAt = Date.now();
    return this.save();
}

module.exports = mongoose.model('UserPreferences', userSchema);