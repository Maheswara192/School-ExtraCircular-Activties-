const express = require('express');
const router = express.Router();
const {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventAvailability,
    getEventById,
    getEventCounts // Import
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

const { cacheMiddleware } = require('../utils/cache');

router.get('/counts', cacheMiddleware(300), getEventCounts); // New Endpoint

router.route('/')
    .get(cacheMiddleware(300), getEvents)
    .post(protect, admin, createEvent);

router.get('/:id/availability', getEventAvailability);

router.route('/:id')
    .get(getEventById)
    .put(protect, admin, updateEvent)
    .delete(protect, admin, deleteEvent);

module.exports = router;
