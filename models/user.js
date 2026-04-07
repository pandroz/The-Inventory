const mongoose = require('mongoose');
const tgUser = require('./tgUser');
const userPreferences = require('./userPreferences');
const { google } = require('googleapis');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        required: true,
        default: ['user']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    telegramId: {
        type: Schema.Types.ObjectId,
        ref: 'TgUser',
        strictPopulate: false
    },
    googleTokens: {
        type: Object,
        default: null
    },
    channelId: {
        type: String,
        default: null
    },
    channelExpiry: {
        type: Date,
        default: null
    },
    channelRefreshToken: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: ''
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    userBio: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    userPreferences: {
        type: Schema.Types.ObjectId,
        ref: 'UserPreferences',
        strictPopulate: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.setActiveStatus = function (activeStatus) {
    this.isActive = activeStatus;
    this.lastActive = Date.now();
    return this.save();
};

userSchema.methods.blockUser = function () {
    this.isBlocked = true;
    return this.save();
};

userSchema.methods.unblockUser = function () {
    this.isBlocked = false;
    return this.save();
}

userSchema.methods.deleteUser = function () {
    this.isDeleted = true;
    return this.save();
}

userSchema.methods.restoreUser = function () {
    this.isDeleted = false;
    return this.save();
}

userSchema.methods.verifyUser = function () {
    this.isVerified = true;
    return this.save();
}

userSchema.methods.updateUser = async function (data) {
    const { name, lastName, email, phoneNumber, telegramId, userBio } = data;

    this.name = name || this.name;
    this.lastName = lastName || this.lastName;
    this.email = email || this.email;
    this.phoneNumber = phoneNumber || this.phoneNumber;
    this.userBio = userBio || this.userBio;
    this.telegramId = telegramId || this.telegramId;
    this.updatedAt = Date.now();

    return this.save();
}



userSchema.statics.saveTokens = function (userId, tokens) {
    return this.findByIdAndUpdate(userId, { googleTokens: tokens })
        .then(user => {
            if (!user) {
                console.log('User not found for token saving');
                return null;
            } else {
                return user;
            }
        });
}


userSchema.statics.findChannelsExpiringWithin = function (timeframeMs) {
    const now = Date.now();
    return this.find({
        googleTokens: { $ne: null },
        channelExpiry: { $lte: new Date(now + timeframeMs) }
    });

}

userSchema.statics.clearTokens = function (userId) {
    return this.findByIdAndUpdate(userId, {
        googleTokens: null,
        channelId: null,
        channelExpiry: null,
        channelRefreshToken: null
    });
}

module.exports = mongoose.model('User', userSchema);