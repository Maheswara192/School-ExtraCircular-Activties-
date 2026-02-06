const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Count Events
        const db = mongoose.connection.db;
        const count = await db.collection('events').countDocuments();
        console.log(`Events Count: ${count}`);

        if (count > 0) {
            const sample = await db.collection('events').findOne();
            console.log("Sample Event:", JSON.stringify(sample, null, 2));
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
