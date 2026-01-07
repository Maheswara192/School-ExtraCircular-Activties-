const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http'); // Import HTTP module
const socket = require('./socket'); // Import Socket logic
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Load environment variables
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app); // Create HTTP server

// Security & Performance Middleware
app.use(helmet()); // Secure Headers
app.use(compression()); // Gzip compression
app.use(cors({
    origin: true, // Allow all origins (reflects request origin)
    credentials: true
}));
app.use(express.json());

// Observability: Request Logging
const morgan = require('morgan');
app.use(morgan('dev'));

// Rate Limiting (Prevent Brute Force)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/auth', limiter); // Apply to auth routes only

// Connect to database
connectDB().then(async () => {
    try {
        const User = require('./models/User');
        // Check if our specific admin exists, if not create/update it
        const adminEmail = 'mahisince2002@gmail.com';

        // Upsert Logic: Check and Update/Create
        let user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log(`Admin ${adminEmail} not found. Creating...`);
            user = new User({
                username: 'admin',
                email: adminEmail,
                password: 'admin123',
                phone: '7675857684',
                role: 'admin'
            });
            await user.save();
            console.log(`Default Admin Created: ${adminEmail} / admin123`);
        } else {
            // Ensure phone and other critical fields are set even if user exists
            let modified = false;
            // Determine if we need to update phone
            if (user.phone !== '7675857684') {
                user.phone = '7675857684';
                modified = true;
            }
            // Force reset password if needed (for debug)
            user.password = 'admin123'; // Logic will hash it
            modified = true;
            // Add other fields updates here if needed in future

            if (modified) {
                await user.save();
                console.log(`Admin ${adminEmail} updated with new phone: 7675857684.`);
            } else {
                console.log(`Admin ${adminEmail} already exists and is up to date.`);
            }
        }
    } catch (err) {
        console.error("Seeding failed:", err);
    }

    // Initialize Socket.IO
    const io = socket.init(server);
    io.on('connection', (socket) => {
        console.log('Client connected: ' + socket.id);
        socket.on('disconnect', () => {
            console.log('Client disconnected: ' + socket.id);
        });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // New Admin Analytics Routes

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Centralized Error Handling (Must be last middleware)
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Debug route
app.get('/api/debug/users', async (req, res) => {
    try {
        const User = require('./models/User');
        const users = await User.find({});
        res.json(users);
    } catch (e) { res.status(500).send(e.message); }
});
