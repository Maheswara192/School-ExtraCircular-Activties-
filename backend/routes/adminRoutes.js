const express = require('express');
const router = express.Router();
const {
    getClassParticipation,
    getActivityParticipation,
    getStudentParticipation
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Analytics Routes
router.get('/participation/class-wise', protect, admin, getClassParticipation);
router.get('/participation/activity-wise', protect, admin, getActivityParticipation);
router.get('/participation/student-wise', protect, admin, getStudentParticipation);

module.exports = router;
