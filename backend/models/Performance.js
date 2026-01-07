const mongoose = require('mongoose');

const performanceSchema = mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    studentName: { // Storing derived data for easier querying, or could ref Application
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['Class', 'School', 'Zonal'],
        default: 'Class'
    },
    score: {
        type: Number,
        required: true // Generic value: could be points, time (seconds), runs, etc.
    },
    metricType: {
        type: String,
        default: 'score' // 'score', 'time', 'rank'
    },
    status: {
        type: String,
        enum: ['Participated', 'Qualified', 'Promoted', 'Disqualified'],
        default: 'Participated'
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index for quick leaderboards
performanceSchema.index({ eventId: 1, class: 1, level: 1, score: -1 });

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
