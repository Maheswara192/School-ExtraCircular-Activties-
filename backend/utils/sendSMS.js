const twilio = require('twilio');

const sendSMS = async (to, message) => {
    try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.warn("Twilio credentials missing. SMS skipped.");
            return;
        }

        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        console.log(`SMS sent to ${to}`);
    } catch (error) {
        console.error(`SMS send failed: ${error.message}`);
    }
};

module.exports = sendSMS;
