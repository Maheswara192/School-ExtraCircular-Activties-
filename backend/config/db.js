const mongoose = require('mongoose');
const path = require('path');
let MongoMemoryServer;
try {
    MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch (e) {
    console.log("optional dependency mongodb-memory-server not installed/found");
}

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        // 1. Try connecting to local/env configured MongoDB
        try {
            // Lower timeout to fail fast if local db is down
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
            console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        } catch (e) {
            console.log(`Local MongoDB not running. Switching to In-Memory Database...`);

            // 2. Fallback to In-Memory if available
            if (MongoMemoryServer) {
                console.log("Attempting to start In-Memory MongoDB on port 27017...");
                // Force port 27017 and set dbPath for persistence
                const persistedPath = path.join(__dirname, '../data');
                const mongod = await MongoMemoryServer.create({
                    instance: {
                        port: 27017,
                        ip: '127.0.0.1',
                        dbPath: persistedPath,
                        storageEngine: 'wiredTiger'
                    }
                });
                // FORCE URI to match .env because Seeder uses .env
                // MongoMemoryServer getUri() might return a random DB name
                uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/school_activities_db";

                console.log(`\n*** MongoDB Running Locally via Backend at: ${uri} ***`);
                console.log(`*** Data is being saved to: ${persistedPath} ***`);
                console.log(`*** You can connect via Compass using: mongodb://localhost:27017 ***\n`);

                await mongoose.connect(uri);
                console.log(`MongoDB In-Memory Connected`);
            } else {
                throw new Error("Local MongoDB failed and mongodb-memory-server not available.");
            }
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error("Please ensure MongoDB is running or 'mongodb-memory-server' is installed.");
        process.exit(1);
    }
};

module.exports = connectDB;
