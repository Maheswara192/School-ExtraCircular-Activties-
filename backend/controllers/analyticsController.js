const Application = require('../models/Application');

// @desc    Get Class-wise participation summary
// @route   GET /api/admin/participation/class-wise
// @access  Private/Admin
const getClassParticipation = async (req, res) => {
    try {
        const stats = await Application.aggregate([
            { $match: { status: 'Accepted' } }, // Only count accepted participations
            {
                $group: {
                    _id: "$class", // Group by Class Name
                    totalStudents: { $addToSet: "$rollNumber" }, // Distinct students
                    totalActivities: { $sum: 1 }, // Total participations
                    activitiesList: { $addToSet: "$activity" } // Distinct activities
                }
            },
            {
                $project: {
                    className: "$_id",
                    studentCount: { $size: "$totalStudents" },
                    activityCount: "$totalActivities",
                    uniqueActivitiesCount: { $size: "$activitiesList" },
                    activities: "$activitiesList",
                    _id: 0
                }
            },
            { $sort: { className: 1 } }
        ]);

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Activity-wise participation summary
// @route   GET /api/admin/participation/activity-wise
// @access  Private/Admin
const getActivityParticipation = async (req, res) => {
    try {
        const stats = await Application.aggregate([
            { $match: { status: 'Accepted' } },
            {
                $group: {
                    _id: "$activity",
                    totalParticipants: { $sum: 1 },
                    classes: { $addToSet: "$class" }
                }
            },
            {
                $project: {
                    activityName: "$_id",
                    participantCount: "$totalParticipants",
                    classesInvolved: "$classes",
                    _id: 0
                }
            },
            { $sort: { participantCount: -1 } }
        ]);

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Student-wise detailed participation
// @route   GET /api/admin/participation/student-wise
// @access  Private/Admin
const getStudentParticipation = async (req, res) => {
    try {
        const stats = await Application.aggregate([
            { $match: { status: 'Accepted' } },
            {
                $group: {
                    _id: "$rollNumber",
                    name: { $first: "$studentName" },
                    class: { $first: "$class" },
                    section: { $first: "$section" },
                    activities: { $push: "$activity" },
                    totalActivities: { $sum: 1 }
                }
            },
            {
                $project: {
                    rollNumber: "$_id",
                    name: "$name",
                    class: "$class",
                    section: "$section",
                    activities: "$activities",
                    activityCount: "$totalActivities",
                    _id: 0
                }
            },
            { $sort: { class: 1, rollNumber: 1 } }
        ]);

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getClassParticipation,
    getActivityParticipation,
    getStudentParticipation
};
