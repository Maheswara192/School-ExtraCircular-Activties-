const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 5 minutes (in seconds)
    }
}, {
    timestamps: true
});

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
