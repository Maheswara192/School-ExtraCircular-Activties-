const Application = require('../models/Application');
const Event = require('../models/Event');
const socket = require('../socket'); // Import socket utility

// @desc    Submit an application
// @route   POST /api/applications
// @access  Public (Student)
const submitApplication = async (req, res) => {
    try {
        const { studentName, class: studentClass, section, rollNumber, phone, eventId, activity, teamName, teamMembers } = req.body;

        // 1. Validation: Event Existence & Config
        let event = null;
        if (eventId) {
            event = await Event.findById(eventId);
            if (!event) return res.status(404).json({ message: 'Event not found' });

            // 1.5 Capacity Check
            if (event.capacity) {
                const currentCount = await Application.countDocuments({ eventId });
                if (currentCount >= event.capacity) {
                    return res.status(400).json({ message: 'Event is full. No more applications accepted.' });
                }
            }

            // 2. Team Validation
            if (event.eventType === 'team') {
                const totalPlayers = 1 + (teamMembers?.length || 0); // Captain + Members
                const { minPlayers, maxPlayers, maxSubstitutes } = event.participationConfig;
                const maxTotal = maxPlayers + maxSubstitutes;

                if (totalPlayers < minPlayers) {
                    return res.status(400).json({ message: `Minimum ${minPlayers} players required for this event.` });
                }
                if (totalPlayers > maxTotal) {
                    return res.status(400).json({ message: `Maximum ${maxTotal} players allowed (including substitutes).` });
                }
            }
        }

        // 3. Duplicate Check (Crucial for Fairness)
        // Check if Main Applicant already applied
        const existingApp = await Application.findOne({ eventId, rollNumber });
        if (existingApp) {
            return res.status(400).json({ message: 'You have already applied for this event.' });
        }

        // Check if any Team Member is already in another team
        if (teamMembers && teamMembers.length > 0) {
            const memberRolls = teamMembers.map(m => m.rollNumber);
            const conflict = await Application.findOne({
                eventId,
                $or: [
                    { rollNumber: { $in: memberRolls } },
                    { "teamMembers.rollNumber": { $in: memberRolls } }
                ]
            });
            if (conflict) {
                return res.status(400).json({ message: 'One or more team members have already applied for this event.' });
            }
        }

        const application = new Application({
            studentName,
            class: studentClass,
            section,
            rollNumber,
            phone,
            eventId,
            activity,
            teamName,       // Fixed: Persist Team Name
            teamMembers     // Fixed: Persist Team Members
        });

        const createdApplication = await application.save();

        // Emit Real-Time Event
        try {
            socket.getIO().emit('new_application', createdApplication);
        } catch (e) {
            console.error("Socket emit failed:", e.message);
        }

        res.status(201).json(createdApplication);
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already applied for this event.' });
        }
        res.status(400).json({ message: error.message || 'Invalid application data' });
    }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private/Admin
const getApplications = async (req, res) => {
    try {
        const applications = await Application.find({}).populate('eventId', 'category subActivities').sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private/Admin
const updateApplication = async (req, res) => {
    try {
        const { status, studentName, class: studentClass, section, rollNumber, phone, activity } = req.body;
        const application = await Application.findById(req.params.id);

        if (application) {
            application.status = status || application.status;
            application.studentName = studentName || application.studentName;
            application.class = studentClass || application.class;
            application.section = section || application.section;
            application.rollNumber = rollNumber || application.rollNumber;
            // email removed
            // email removed
            application.phone = phone || application.phone;
            application.activity = activity || application.activity;

            const updatedApplication = await application.save();

            // Emit Real-Time Status Update
            try {
                socket.getIO().emit('application_updated', updatedApplication);
            } catch (e) {
                console.error("Socket emit failed:", e.message);
            }

            res.json(updatedApplication);
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private/Admin
const deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (application) {
            await application.deleteOne();
            res.json({ message: 'Application removed' });
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    submitApplication,
    getApplications,
    updateApplication,
    deleteApplication
};
