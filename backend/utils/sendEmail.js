const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        if (process.env.EMAIL_USER.includes('your-email')) {
            console.log(`[SIMULATED] Email would be sent to ${options.email}`);
            console.log(`[SIMULATED] Subject: ${options.subject}`);
            console.log(`[SIMULATED] Content: ${options.message}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Fix for local dev SSL issues
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.email}`);
    } catch (error) {
        console.error(`Email send failed: ${error.message}`);
        // Fallback: Log the content so dev can see the OTP
        console.log("---------------------------------------------------");
        console.log(" [FALLBACK] EMAIL FAILED. HERE IS THE MESSAGE content:");
        console.log(` To: ${options.email}`);
        console.log(` Subject: ${options.subject}`);
        console.log(` Message: ${options.message}`);
        console.log("---------------------------------------------------");
        // We do NOT throw here, to allow the frontend to proceed to the OTP entry screen
        // throw new Error(`Email could not be sent: ${error.message}`);
    }
};

module.exports = sendEmail;
