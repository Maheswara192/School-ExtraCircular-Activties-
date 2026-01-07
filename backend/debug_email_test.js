const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const sendEmail = require('./utils/sendEmail');

(async () => {
    console.log("--- Email Debugger ---");
    console.log("EMAIL_USER:", process.env.EMAIL_USER || "Not Set");
    console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "Not Set");
    console.log("EMAIL_PASS Length:", (process.env.EMAIL_PASS || "").length);

    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email')) {
        console.log("WARNING: EMAIL_USER seems to be default/placeholder. Please update .env");
    }

    try {
        console.log("Attempting to send test email to:", process.env.EMAIL_USER);
        await sendEmail({
            email: process.env.EMAIL_USER, // Send to self to test
            subject: 'Test Email from Debugger',
            message: 'If you received this, email sending is working!'
        });
        console.log("SUCCESS: Email sent successfully!");
    } catch (error) {
        console.error("FAILURE: Could not send email.");
        console.error("Error Message:", error.message);
        // console.error("Full Error:", error);
    }
})();
