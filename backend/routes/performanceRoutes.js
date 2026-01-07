const express = require('express');
const router = express.Router();
const { addPerformance, getLeaderboard, promoteStudents } = require('../controllers/performanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, addPerformance);
router.get('/leaderboard', getLeaderboard);
router.post('/promote', protect, admin, promoteStudents);

module.exports = router;
