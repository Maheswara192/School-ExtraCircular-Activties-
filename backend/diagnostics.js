const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Otp = require('./models/Otp');
const axios = require('axios');

dotenv.config();

const diagnose = async () => {
    try {
        console.log("--- Starting Diagnostics ---");

        // 1. Connect DB
        await connectDB();

        // 2. Check Admin User
        const adminEmail = 'mahisince2002@gmail.com';
        const admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            console.log(`❌ Admin user '${adminEmail}' NOT FOUND.`);
            // Auto-seed here if needed, but report first
            console.log("Creating Admin...");
            await User.create({
                username: 'admin',
                email: adminEmail,
                password: 'admin123',
                phone: '7675857684',
                role: 'admin'
            });
            console.log("✅ Admin Created.");
        } else {
            console.log("✅ Admin user found.");
            console.log(`   Email: ${admin.email}`);
            console.log(`   Phone: ${admin.phone}`);

            // Fix phone if missing
            if (!admin.phone || admin.phone !== '7675857684') {
                admin.phone = '7675857684';
                await admin.save();
                console.log("   -> Phone number updated to 7675857684");
            }
        }

        // 3. Clear OTPs
        await Otp.deleteMany({});
        console.log("✅ Cleared old OTPs.");

        console.log("--- End Diagnostics ---");
        // Don't exit process if you want to keep db session, but for this script we exit
        process.exit();

    } catch (error) {
        console.error("Diagnostic Failed:", error);
        process.exit(1);
    }
}

diagnose();
