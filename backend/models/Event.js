const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    // Modifying Date logic to support separated separation
    // Backward compatibility: 'date' can be synonymous with 'startDate'
    startDate: {
        type: String, // ISO Date String YYYY-MM-DD
        required: true,
        index: true
    },
    endDate: {
        type: String, // ISO Date String YYYY-MM-DD
        required: true
    },
    // Optional: Keep 'date' for backward compatibility or display text
    date: {
        type: String,
        required: false
    },
    time: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    subActivities: {
        type: [String], // Array of strings
        default: []
    },
    // Visuals
    icon: {
        type: String,
        default: 'cal' // default icon code
    },
    image: {
        type: String, // URL/Path to image
        default: ''
    },
    // NEW: Configuration for Event Participation
    eventType: {
        type: String,
        enum: ['individual', 'team'],
        default: 'individual'
    },
    participationConfig: {
        minPlayers: { type: Number, default: 1 },
        maxPlayers: { type: Number, default: 1 }, // e.g. 11 for Football
        maxSubstitutes: { type: Number, default: 0 }, // e.g. 2 for Football
        teamSize: { type: Number, default: 1 } // Target team size
    },
    // NEW: Performance Metric Config for Leaderboards
    metricConfig: {
        metricLabel: { type: String, default: 'Score' }, // e.g. 'Time (seconds)', 'Goals', 'Points'
        sortBy: { type: String, enum: ['asc', 'desc'], default: 'desc' }, // desc for score, asc for time
        unit: { type: String, default: 'pts' }
    },
    // NEW: Global Capacity (Max number of Applications allowed)
    capacity: {
        type: Number,
        default: null // null means unlimited
    }
}, {
    timestamps: true
});

// Compound index for finding events by category sorted by date
eventSchema.index({ category: 1, startDate: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
