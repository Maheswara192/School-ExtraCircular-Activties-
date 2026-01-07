const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const connectDB = require('./config/db');

dotenv.config();

// Override for testing
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/school_activities_db';

const debugDb = async () => {
    try {
        console.log("Connecting DB...");
        await connectDB();

        console.log("Counting docs...");
        const total = await Event.countDocuments();
        console.log("Total:", total);

        console.log("Fetching docs...");
        const events = await Event.find({})
            .sort({ date: 1 })
            .limit(20)
            .skip(0);

        console.log(`Fetched ${events.length} events.`);
        if (events.length > 0) {
            console.log("First event:", events[0]);
        }

        process.exit(0);
    } catch (error) {
        console.error("DB Debug Error:", error);
        process.exit(1);
    }
};

debugDb();
