const Event = require('../models/Event');
const Application = require('../models/Application');
const cache = require('../utils/cache');

// Cache Key Prefix
const EVENTS_CACHE_KEY = '/api/events';

// @desc    Get all events (Optimized with Pagination & Cache)
// @route   GET /api/events
// @access  Public
// @desc    Get all events (Optimized with Pagination & Cache & Filtering)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const startIndex = (page - 1) * limit;
        const status = req.query.status; // 'present' | 'upcoming' | 'all'

        // Get current date YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        let query = {};

        if (status === 'present') {
            // Present: Created/Start <= Today <= End
            query = {
                startDate: { $lte: today },
                endDate: { $gte: today }
            };
        } else if (status === 'upcoming') {
            // Upcoming: Start > Today
            query = {
                startDate: { $gt: today }
            };
        }

        // DB Query
        const total = await Event.countDocuments(query);

        let events = await Event.find(query)
            .sort({ startDate: 1 }) // Nearest first
            .limit(limit)
            .skip(startIndex)
            .lean();

        // Dynamically add 'status' field for frontend convenience if not stored
        events = events.map(evt => {
            let derivedStatus = 'upcoming';
            if (evt.startDate <= today && evt.endDate >= today) derivedStatus = 'present';
            else if (evt.endDate < today) derivedStatus = 'past';

            // Ensure date field is populated for frontend display (Fallback to startDate)
            const displayDate = evt.date || evt.startDate;

            return {
                ...evt,
                status: derivedStatus,
                date: displayDate
            };
        });


        const result = {
            data: events,
            page,
            pages: Math.ceil(total / limit),
            total
        };

        res.json(result);
    } catch (error) {
        console.error("getEvents Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    try {
        const {
            eventName, category, startDate, endDate, date, time, venue, subActivities, description,
            eventType, participationConfig, metricConfig, capacity, icon, image
        } = req.body;

        const event = new Event({
            eventName,
            category,
            startDate,
            endDate,
            date,
            time,
            venue,
            subActivities,
            description,
            eventType,
            participationConfig,
            metricConfig,
            capacity,
            icon,   // Added
            image   // Added
        });

        const createdEvent = await event.save();

        // Invalidate Cache globally for events list
        cache.flush('/api/events');

        res.status(201).json(createdEvent);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid event data: ' + error.message });
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
    try {
        const {
            eventName, category, startDate, endDate, date, time, venue, subActivities, description,
            eventType, participationConfig, metricConfig, capacity, icon, image
        } = req.body;

        const event = await Event.findById(req.params.id);

        if (event) {
            event.eventName = eventName || event.eventName;
            event.category = category || event.category;
            event.startDate = startDate || event.startDate;
            event.endDate = endDate || event.endDate;
            event.date = date || event.date;
            event.time = time || event.time;
            event.venue = venue || event.venue;
            event.subActivities = subActivities || event.subActivities;
            event.description = description || event.description;
            // Update New Fields
            if (eventType) event.eventType = eventType;
            if (participationConfig) event.participationConfig = { ...event.participationConfig, ...participationConfig };
            if (metricConfig) event.metricConfig = { ...event.metricConfig, ...metricConfig };
            if (capacity !== undefined) event.capacity = capacity;
            if (icon) event.icon = icon;   // Added
            if (image) event.image = image; // Added

            const updatedEvent = await event.save();

            // Invalidate Cache for main list
            cache.flush('/api/events');

            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            await event.deleteOne();

            // Invalidate Cache
            cache.flush('/api/events');

            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get event availability
// @route   GET /api/events/:id/availability
// @access  Public
const getEventAvailability = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (!event.capacity) {
            return res.json({ available: true, remaining: null, total: null });
        }

        const count = await Application.countDocuments({ eventId: req.params.id });
        const remaining = Math.max(0, event.capacity - count);

        res.json({
            available: remaining > 0,
            remaining,
            total: event.capacity
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get event counts (Present vs Upcoming)
// @route   GET /api/events/counts
// @access  Public (or Admin protected if strictly needed, but prompt implies general validation)
const getEventCounts = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const presentCount = await Event.countDocuments({
            startDate: { $lte: today },
            endDate: { $gte: today }
        });

        const upcomingCount = await Event.countDocuments({
            startDate: { $gt: today }
        });

        const totalEvents = await Event.countDocuments({});

        res.json({
            presentCount,
            upcomingCount,
            totalEvents
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventAvailability,
    getEventById,
    getEventCounts // Exported
};
