const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        googleEventId: {
            type: String,
            required: true,
            unique: true,
        },
        calendarId: {
            type: String,
            default: 'primary',
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        location: {
            type: String,
            default: '',
        },
        start: {
            dateTime: { type: Date, required: true },
            timeZone: { type: String, default: 'UTC' },
        },
        end: {
            dateTime: { type: Date, required: true },
            timeZone: { type: String, default: 'UTC' },
        },
        // All-day events use a date string instead of dateTime (e.g. "2026-03-01")
        isAllDay: {
            type: Boolean,
            default: false,
        },
        // Tracks where the event was originally created
        // so you can avoid duplicate syncs
        source: {
            type: String,
            enum: ['app', 'google'],
            required: true,
        },

        // Google's sync status — useful when handling webhook notifications
        status: {
            type: String,
            enum: ['confirmed', 'tentative', 'cancelled'],
            default: 'confirmed',
        },

        // Attendees list if you need it
        attendees: [
            {
                email: { type: String },
                displayName: { type: String },
                responseStatus: {
                    type: String,
                    enum: ['accepted', 'declined', 'tentative', 'needsAction'],
                    default: 'needsAction',
                },
            },
        ],

        // Store the raw Google event payload as a fallback
        // so you don't lose any fields you're not explicitly mapping
        rawGoogleEvent: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

// Quickly find all events for a user sorted by start date
eventSchema.index({ userId: 1, 'start.dateTime': 1 });

// Quickly look up by Google's event ID during webhook syncs
eventSchema.index({ googleEventId: 1 });

module.exports = mongoose.model('Event', eventSchema);