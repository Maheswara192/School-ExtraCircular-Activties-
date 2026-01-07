const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Forgot Password - Generate Real OTP
// @route   POST /api/auth/forgot
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        let { contact } = req.body; // Can be email or phone

        if (!contact) {
            return res.status(400).json({ message: 'Please provide email or phone' });
        }

        contact = contact.trim();
        console.log("Forgot Password Request for:", contact);

        // Basic format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,15}$/;

        const isEmail = contact.includes('@');

        if (isEmail && !emailRegex.test(contact)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!isEmail && !phoneRegex.test(contact)) {
            return res.status(400).json({ message: 'Invalid phone format (10-15 digits required)' });
        }

        // Determine query based on input type
        const query = isEmail ? { email: contact.toLowerCase() } : { phone: contact };

        const user = await User.findOne(query);

        if (!user) {
            console.log("User not found for query:", query);
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before saving
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // Save to OTP collection (delete old OTPs for this user first)
        await Otp.deleteMany({ userId: user._id });
        await Otp.create({
            userId: user._id,
            otp: hashedOtp
        });

        // Send OTP based on type
        if (isEmail) {
            const message = `Your OTP for password reset is: ${otp}. It expires in 5 minutes.`;

            console.log(`OTP generated for ${user.email}: ${otp}`); // Logged BEFORE sending (for Dev/Debug)

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Password Reset OTP',
                    message
                });
            } catch (emailErr) {
                console.log("Email sending failed:", emailErr.message);
                // RETURN DETAILED ERROR TO FRONTEND
                return res.status(500).json({ message: 'Error sending email: ' + emailErr.message });
            }

            res.json({ message: 'OTP sent to email' });
        } else {
            const message = `Your OTP for password reset is: ${otp}. Valid for 5 minutes.`;
            // Check if SMS sending is enabled/configured
            if (process.env.TWILIO_ACCOUNT_SID) {
                await sendSMS(user.phone, message);
                console.log(`OTP sent to phone ${user.phone}`);
                res.json({ message: 'OTP sent to phone' });
            } else {
                // Fallback for demo if no SMS keys
                console.log(`[SIMULATION] SMS to ${user.phone}: ${message}`);
                res.json({ message: 'OTP sent to phone (Simulation)' });
            }
        }
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Verify Real OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        const { contact, otp } = req.body;
        console.log(`Verifying OTP for ${contact}`);

        if (!contact || !otp) {
            return res.status(400).json({ message: 'Please provide contact and OTP' });
        }

        const isEmail = contact.includes('@');
        const query = isEmail ? { email: contact.toLowerCase() } : { phone: contact };

        const user = await User.findOne(query);
        if (!user) {
            return res.status(400).json({ message: 'Invalid user' });
        }

        const otpRecord = await Otp.findOne({ userId: user._id });

        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP expired or invalid' });
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        res.json({ message: 'OTP Verified', contact: contact });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: 'Server Verification Error', error: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { contact, newPassword, otp } = req.body;
        console.log(`Resetting password for ${contact}`);

        if (!contact || !otp || !newPassword) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const isEmail = contact.includes('@');
        const query = isEmail ? { email: contact.toLowerCase() } : { phone: contact };

        const user = await User.findOne(query);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Verify OTP again to be secure
        const otpRecord = await Otp.findOne({ userId: user._id });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Session expired, please request OTP again' });
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Update password
        user.password = newPassword; // Middleware will hash it
        await user.save();

        // Delete OTP
        await Otp.deleteMany({ userId: user._id });

        // Send Confirmation
        if (user.email) {
            await sendEmail({
                email: user.email,
                subject: 'Password Changed Successfully',
                message: 'Your password has been reset successfully.'
            });
        }

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Server Reset Error', error: error.message });
    }
};

module.exports = {
    loginUser,
    forgotPassword,
    verifyOtp,
    resetPassword
};
