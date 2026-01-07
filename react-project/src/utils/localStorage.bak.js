/**
 * localStorage.js
 * Handles all browser interactions for data persistence.
 * OPTIMIZED: Uses in-memory caching to reduce expensive JSON.parse calls.
 */

const DB_KEYS = {
    EVENTS: 'school_events',
    APPLICATIONS: 'school_applications',
    CATEGORIES: 'school_categories',
    ADMIN_SESSION: 'admin_logged_in'
};

// Initial Data Seeding
const INITIAL_EVENTS = [
    {
        id: 'evt_001',
        name: 'Annual Science Fair',
        category: 'STEM & Research',
        date: '2023-11-15',
        time: '09:00',
        venue: 'Main Auditorium',
        description: 'Showcase your innovative science projects.'
    },
    {
        id: 'evt_002',
        name: 'Inter-School Football Cup',
        category: 'Sports & Physical Activities',
        date: '2023-11-20',
        time: '14:00',
        venue: 'School Ground',
        description: 'Competitive football tournament.'
    },
    {
        id: 'evt_003',
        name: 'Creative Writing Workshop',
        category: 'Arts & Creative Expression',
        date: '2023-11-25',
        time: '10:00',
        venue: 'Library Hall',
        description: 'Enhance your storytelling skills.'
    }
];

export const INITIAL_CATEGORIES = {
    "Academic & Intellectual Activities": ["Debate Club", "Math Olympiad", "Quiz Club", "Chess Club"],
    "Arts & Creative Expression": ["Drama Club", "Music Band", "Painting Workshop", "Creative Writing"],
    "Sports & Physical Activities": ["Football Team", "Basketball Team", "Swimming", "Yoga"],
    "Leadership & Service": ["Student Council", "Charity Drive", "Mentorship Program"],
    "Technology & Innovation": ["App Development Club", "Web Design Club", "AI/ML Club", "Cybersecurity Club"],
    "Lifestyle & Wellness": ["Cooking Class", "Mindfulness Session", "Nutrition Workshop"],
    "Cultural & Global Awareness": ["Foreign Language Club", "Cultural Exchange", "History Club"],
    "Miscellaneous & Fun": ["Board Games Club", "Magic Tricks", "Stand-up Comedy"],
    "STEM & Research": ["Science Fair", "Robotics Club", "Astronomy Club"],
    "Outdoor & Nature": ["Hiking Club", "Gardening", "Bird Watching"],
    "Literary & Media": ["School Newsletter", "Photography Club", "Book Club"]
};

// --- CACHE LAYER ---
const cache = {
    [DB_KEYS.EVENTS]: null,
    [DB_KEYS.APPLICATIONS]: null,
    [DB_KEYS.CATEGORIES]: null
};

// Generic helper to get data with caching
const getWithCache = (key) => {
    if (cache[key]) return cache[key];
    const raw = localStorage.getItem(key);
    // Default fallback based on key type
    const fallback = key === DB_KEYS.CATEGORIES ? '{}' : '[]';
    const data = JSON.parse(raw || fallback);
    cache[key] = data;
    return data;
};

// Generic helper to save data and update cache
const saveWithCache = (key, data) => {
    cache[key] = data; // Update memory immediately
    localStorage.setItem(key, JSON.stringify(data)); // Persist to disk
};

// Initialize DB
export const initDB = () => {
    if (!localStorage.getItem(DB_KEYS.EVENTS)) {
        localStorage.setItem(DB_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem(DB_KEYS.APPLICATIONS)) {
        localStorage.setItem(DB_KEYS.APPLICATIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.CATEGORIES)) {
        localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
};

// --- DATA ACCESS METHODS ---

export const getEvents = () => getWithCache(DB_KEYS.EVENTS);

export const saveEvent = (event) => {
    const events = [...getEvents()]; // Clone to avoid mutation side effects
    if (event.id) {
        const index = events.findIndex(e => e.id === event.id);
        if (index !== -1) events[index] = event;
    } else {
        event.id = 'evt_' + Date.now();
        events.push(event);
    }
    saveWithCache(DB_KEYS.EVENTS, events);
};

export const deleteEvent = (id) => {
    const events = getEvents().filter(e => e.id !== id);
    saveWithCache(DB_KEYS.EVENTS, events);
};

export const getApplications = () => getWithCache(DB_KEYS.APPLICATIONS);

export const saveApplication = (app) => {
    const apps = [...getApplications()];
    const newApp = {
        ...app,
        id: app.id || 'app_' + Date.now(),
        status: app.status || 'Pending',
        submittedAt: app.submittedAt || new Date().toISOString()
    };

    // Update if exists, else push
    const index = apps.findIndex(a => a.id === newApp.id);
    if (index !== -1) {
        apps[index] = newApp; // Replace
    } else {
        apps.push(newApp); // Add
    }

    saveWithCache(DB_KEYS.APPLICATIONS, apps);
    return true;
};

export const updateAppStatus = (id, status) => {
    const apps = [...getApplications()];
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
        apps[index] = { ...apps[index], status }; // Create new reference
        saveWithCache(DB_KEYS.APPLICATIONS, apps);
    }
};

export const updateApplicationDetails = (id, updates) => {
    const apps = [...getApplications()];
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
        apps[index] = { ...apps[index], ...updates };
        saveWithCache(DB_KEYS.APPLICATIONS, apps);
    }
};

export const deleteApplication = (id) => {
    const apps = getApplications().filter(a => a.id !== id);
    saveWithCache(DB_KEYS.APPLICATIONS, apps);
};

export const getCategories = () => getWithCache(DB_KEYS.CATEGORIES);

// --- OTP & CREDENTIALS MANAGMENT ---

// Helper to get admin creds (simulated DB)
const getAdminCreds = () => {
    const stored = localStorage.getItem('admin_credentials');
    return stored ? JSON.parse(stored) : {
        username: "admin",
        password: "admin123",
        email: "admin@school.com",
        phone: "9999999999"
    };
};

export const saveAdminCreds = (creds) => {
    localStorage.setItem('admin_credentials', JSON.stringify(creds));
};

export const generateOTP = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date().getTime() + 2 * 60 * 1000; // 2 minutes
    const otpData = { code, expiresAt };
    localStorage.setItem('admin_otp', JSON.stringify(otpData));
    return code;
};

export const verifyOTP = (inputCode) => {
    const stored = localStorage.getItem('admin_otp');
    if (!stored) return false;

    const { code, expiresAt } = JSON.parse(stored);
    if (new Date().getTime() > expiresAt) return false; // Expired

    return code === inputCode;
};

export const clearOTP = () => {
    localStorage.removeItem('admin_otp');
};

// --- AUTH METHODS ---
export const loginAdmin = (username, password) => {
    const creds = getAdminCreds();
    if (username === creds.username && password === creds.password) {
        localStorage.setItem(DB_KEYS.ADMIN_SESSION, 'true');
        return true;
    }
    return false;
};

export const logoutAdmin = () => {
    localStorage.removeItem(DB_KEYS.ADMIN_SESSION);
};

export const isAdminLoggedIn = () => {
    return localStorage.getItem(DB_KEYS.ADMIN_SESSION) === 'true';
};
