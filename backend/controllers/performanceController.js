const Performance = require('../models/Performance');
const Event = require('../models/Event');

// @desc    Add or Update a Performance Record
// @route   POST /api/performance
// @access  Admin
const addPerformance = async (req, res) => {
    try {
        const { eventId, studentName, rollNumber, class: studentClass, score, level } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Upsert logic: Update score if exists for same level/event/student
        const filter = { eventId, rollNumber, level };
        const update = {
            studentName,
            class: studentClass,
            score,
            metricType: event.metricConfig?.metricLabel || 'Score',
            status: 'Participated' // Reset status on new score update
        };

        const performance = await Performance.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true
        });

        // Real-time Update
        const io = require('../socket').getIO();
        io.emit('leaderboard_update', { eventId, level });

        res.status(201).json(performance);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get Leaderboard (Class or School Level)
// @route   GET /api/performance/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const { eventId, level, class: studentClass } = req.query; // Filter query

        const query = { eventId, level: level || 'Class' };
        if (studentClass && level === 'Class') query.class = studentClass;

        // Fetch Event to know sorting order
        const event = await Event.findById(eventId);
        const sortOrder = event?.metricConfig?.sortBy === 'asc' ? 1 : -1;

        const results = await Performance.find(query)
            .sort({ score: sortOrder })
            .limit(100); // Limit top 100

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Promote Top Students to Next Level
// @route   POST /api/performance/promote
// @access  Admin
const promoteStudents = async (req, res) => {
    try {
        const { eventId, currentLevel, nextLevel, limit } = req.body;
        // limit: How many to promote (e.g., Top 3 from Class -> School)

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        const sortOrder = event?.metricConfig?.sortBy === 'asc' ? 1 : -1;

        // Group by Class if promoting from Class -> School
        // Logic: For each class, find Top N.

        // This is a simplified "Batch Promotion" for School -> Zonal
        // For Class -> School, we might iterate all classes. Let's handle School -> Zonal here (Top N of School).

        let candidates;
        if (currentLevel === 'Class') {
            // Complex aggregation needed for "Top N per Class"
            // For MVP, allow admin to promote specific list or handle simplified School-wide logic
            // Let's implement: "Get Top N students of the School Level and move to Zonal"
            return res.status(400).json({ message: 'Use School->Zonal promotion for this endpoint currently.' });
        } else {
            candidates = await Performance.find({ eventId, level: currentLevel })
                .sort({ score: sortOrder })
                .limit(limit || 5);
        }

        const stats = { promoted: 0 };

        for (const candidate of candidates) {
            // Check if already exists at higher level
            const exists = await Performance.findOne({
                eventId,
                rollNumber: candidate.rollNumber,
                level: nextLevel
            });

            if (!exists) {
                await Performance.create({
                    eventId,
                    studentName: candidate.studentName,
                    rollNumber: candidate.rollNumber,
                    class: candidate.class,
                    level: nextLevel,
                    score: 0, // Reset score for new level
                    metricType: event.metricConfig?.metricLabel,
                    status: 'Qualified'
                });

                // Update old status
                candidate.status = 'Promoted';
                await candidate.save();
                stats.promoted++;
            }
        }

        res.json({ message: 'Promotion executed', stats });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { addPerformance, getLeaderboard, promoteStudents };
