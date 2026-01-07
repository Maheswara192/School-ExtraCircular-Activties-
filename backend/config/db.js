const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Enforce Cloud/Production DB URI
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!uri) {
            throw new Error("⛔ MongoDB URI is missing! Please set MONGODB_URI in your environment variables.");
        }

        if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
            console.warn("⚠️ WARNING: You are using a local MongoDB URI in a potential production environment.");
        }

        console.log("⏳ Connecting to MongoDB Atlas...");

        const conn = await mongoose.connect(uri, {
            // These options are default in Mongoose 6+, but keeping them doesn't hurt for clarity if older version
            serverSelectionTimeoutMS: 5000, // Fail fast in 5s if Atlas is unreachable
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error("-> Check your .env or Render Environment Variables.");
        console.error("-> Ensure your IP is whitelisted in MongoDB Atlas Network Access.");

        // Exit process with failure to prevent app from running without DB
        process.exit(1);
    }
};

module.exports = connectDB;
