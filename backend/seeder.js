const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Event.deleteMany();
        // Clean up linked data
        const Application = require('./models/Application');
        const Performance = require('./models/Performance');
        await Application.deleteMany();
        await Performance.deleteMany();

        const adminUser = new User({
            username: 'admin',
            email: 'mahisince2002@gmail.com',
            password: 'admin123', // Will be hashed by pre-save middleware
            phone: '9999999999',
            role: 'admin'
        });

        await adminUser.save();

        // Helper to get date string YYYY-MM-DD with offset
        const getDateStr = (offsetDays) => {
            const d = new Date();
            d.setDate(d.getDate() + offsetDays);
            return d.toISOString().split('T')[0];
        };

        const events = [
            // --- PRESENT EVENTS (ACTIVITIES) ---
            {
                eventName: "Football Practice Sessions",
                category: "Sports & Physical Education",
                startDate: getDateStr(-10), endDate: getDateStr(30),
                time: "16:00", venue: "School Turf",
                subActivities: ["Dribbling Drills", "Match Practice", "Fitness Training"],
                description: "Daily football training for the school team and enthusiasts.",
                eventType: 'team', participationConfig: { minPlayers: 11, maxPlayers: 18, maxSubstitutes: 7 },
                icon: '⚽',
                image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Dance Workshops",
                category: "Dance",
                startDate: getDateStr(-2), endDate: getDateStr(5),
                time: "15:30", venue: "Dance Studio",
                subActivities: ["Contemporary", "Hip Hop", "Classical"],
                description: "Express yourself through movement in our intensive workshops.",
                eventType: 'individual',
                icon: '💃',
                image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Music Band Rehearsals",
                category: "Music",
                startDate: getDateStr(-5), endDate: getDateStr(30),
                time: "17:00", venue: "Music Room",
                subActivities: ["Drumming", "Guitar Jam", "Vocal Training"],
                description: "Join the school band and prepare for upcoming performances.",
                eventType: 'team', participationConfig: { minPlayers: 3, maxPlayers: 8, maxSubstitutes: 0 },
                icon: '🎵',
                image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Robotics Club Meetings",
                category: "Science & Technology",
                startDate: getDateStr(-15), endDate: getDateStr(15),
                time: "14:00", venue: "Innovation Lab",
                subActivities: ["Arduino Coding", "Bot Assembly", "Drone Testing"],
                description: "Hands-on robotics and automation projects.",
                eventType: 'team',
                icon: '🤖',
                image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Debate Club Sessions",
                category: "Literature & Language",
                startDate: getDateStr(0), endDate: getDateStr(10),
                time: "13:00", venue: "Conference Hall",
                subActivities: ["Public Speaking", "Policy Debate", "Extempore"],
                description: "Sharpen your argumentation and public speaking skills.",
                eventType: 'individual',
                icon: '🎤',
                image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Canvas Painting",
                category: "Arts & Crafts",
                startDate: getDateStr(-5), endDate: getDateStr(20),
                time: "10:00", venue: "Art Studio",
                subActivities: ["Oil Painting", "Watercolor", "Sketching"],
                description: "Unleash your creativity on canvas.",
                eventType: 'individual',
                icon: '🎨',
                image: 'https://images.unsplash.com/photo-1460661619275-d4c925613ea9?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Community Clean-up",
                category: "Social Service & Leadership",
                startDate: getDateStr(-2), endDate: getDateStr(5),
                time: "08:00", venue: "Community Park",
                subActivities: ["Trash Collection", "Recycling Workshop"],
                description: "Giving back to the community by keeping it clean.",
                eventType: 'team',
                icon: '🤝',
                image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Yoga & Meditation",
                category: "Wellness & Mindfulness",
                startDate: getDateStr(-10), endDate: getDateStr(10),
                time: "07:00", venue: "Yoga Hall",
                subActivities: ["Surya Namaskar", "Breathing Exercises", "Meditation"],
                description: "Find your inner peace and improve flexibility.",
                eventType: 'individual',
                icon: '🧘',
                image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Theater Workshop",
                category: "Drama & Theatre",
                startDate: getDateStr(-3), endDate: getDateStr(14),
                time: "15:00", venue: "Auditorium",
                subActivities: ["Acting", "Script Reading", "Improv"],
                description: "Explore the world of drama and acting.",
                eventType: 'team',
                icon: '🎭',
                image: 'https://images.unsplash.com/photo-1503095392237-7362463f6c0f?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Eco Club",
                category: "Environmental & Sustainability",
                startDate: getDateStr(-1), endDate: getDateStr(30),
                time: "16:00", venue: "School Garden",
                subActivities: ["Planting", "Composting", "Bird Watching"],
                description: "Learn to protect and sustain our environment.",
                eventType: 'team',
                icon: '🌱',
                image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Cooking Class",
                category: "Culinary Arts",
                startDate: getDateStr(-2), endDate: getDateStr(5),
                time: "11:00", venue: "Home Economics Lab",
                subActivities: ["Baking", "Chopping Skills", "Plating"],
                description: "Master the art of cooking delicious meals.",
                eventType: 'individual',
                icon: '🍳',
                image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Photography Walk",
                category: "Digital & Media",
                startDate: getDateStr(-1), endDate: getDateStr(2),
                time: "09:00", venue: "City Centre",
                subActivities: ["Composition", "Lighting", "Editing"],
                description: "Capture the beauty of the world through a lens.",
                eventType: 'individual',
                icon: '📷',
                image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Trekking Expedition",
                category: "Outdoor & Adventure",
                startDate: getDateStr(2), endDate: getDateStr(4),
                time: "06:00", venue: "Nearby Hills",
                subActivities: ["Hiking", "Camping", "Navigation"],
                description: "Adventure in the great outdoors.",
                eventType: 'team',
                icon: '🧗',
                image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Math Olympiad Club",
                category: "Academic Clubs",
                startDate: getDateStr(-10), endDate: getDateStr(20),
                time: "15:00", venue: "Room 101",
                subActivities: ["Problem Solving", "Logic Puzzles"],
                description: "Advanced mathematics for competitive students.",
                eventType: 'individual',
                icon: '📐',
                image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800'
            },

            // --- FUTURE EVENTS (UPCOMING) ---
            {
                eventName: "Annual Sports Meet",
                category: "Sports & Physical Education",
                startDate: getDateStr(15), endDate: getDateStr(18),
                time: "08:00", venue: "Main Stadium",
                subActivities: ["Track & Field", "Relay Race", "Long Jump"],
                description: "The biggest annual sporting event of the year.",
                eventType: 'individual',
                icon: '🏆',
                image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Inter-School Quiz",
                category: "Academic Clubs",
                startDate: getDateStr(10), endDate: getDateStr(10),
                time: "11:00", venue: "Auditorium",
                subActivities: ["General Knowledge", "Science Quiz", "History Trivia"],
                description: "Test your knowledge against the best schools in the region.",
                eventType: 'team', participationConfig: { minPlayers: 2, maxPlayers: 4, maxSubstitutes: 1 },
                icon: '❓',
                image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Cultural Fest",
                category: "Cultural & Heritage",
                startDate: getDateStr(25), endDate: getDateStr(28),
                time: "10:00", venue: "Open Air Theatre",
                subActivities: ["Folk Dance", "Traditional Fashion Show", "Food Stalls"],
                description: "Celebrating our diverse cultural heritage.",
                eventType: 'team',
                icon: '🌍',
                image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Zonal Level Games",
                category: "Sports & Physical Education",
                startDate: getDateStr(30), endDate: getDateStr(35),
                time: "09:00", venue: "City Sports Complex",
                subActivities: ["Basketball", "Volleyball", "Badminton"],
                description: "Qualifiers for the state championship.",
                eventType: 'team',
                icon: '🥇',
                image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Science Exhibition",
                category: "Science & Technology",
                startDate: getDateStr(20), endDate: getDateStr(21),
                time: "10:00", venue: "Exhibition Hall",
                subActivities: ["Model Display", "Live Demos"],
                description: "Innovative detailed models and experiments by students.",
                eventType: 'individual',
                icon: '🚀',
                image: 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?auto=format&fit=crop&q=80&w=800'
            },
            {
                eventName: "Hackathon 2026",
                category: "Science & Technology",
                startDate: getDateStr(40), endDate: getDateStr(42),
                time: "18:00", venue: "Tech Hub",
                subActivities: ["Web Dev", "AI Challenge", "Cybersecurity Capture the Flag"],
                description: "48-hour coding marathon to solve real-world problems.",
                eventType: 'team', participationConfig: { minPlayers: 2, maxPlayers: 5, maxSubstitutes: 0 },
                icon: '💻',
                image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800'
            }

        await Event.insertMany(events);
        console.log(`Added ${events.length} activities to the catalog.`);
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
