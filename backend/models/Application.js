const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    // Email removed as per requirement
    phone: {
        type: String,
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: false
    },
    activity: { // Name of the event/activity
        type: String,
        required: true
    },
    // NEW: Team & Multi-Player Support
    teamName: {
        type: String,
        required: false
    },
    teamMembers: [{
        name: String,
        rollNumber: String,
        isSubstitute: { type: Boolean, default: false }
    }],
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending',
        index: true // Optimized for filtering by status
    }
}, {
    timestamps: true
});

// Prevent duplicate applications by same rollNumber for same event
applicationSchema.index({ eventId: 1, rollNumber: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
