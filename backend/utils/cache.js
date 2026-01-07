const NodeCache = require('node-cache');

// Standard TTL: 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Caching Middleware / Utility
 * 
 * Strategy: 
 * We use an in-memory cache (faster than Redis for single instance, 
 * but for horizontal scaling, this file would be replaced by Redis client).
 * 
 * This simulates the interface we would use for a distributed cache.
 */

const get = (key) => {
    return cache.get(key);
};

const set = (key, value, ttl = 300) => {
    cache.set(key, value, ttl);
};

const del = (key) => {
    cache.del(key);
};

const flush = (prefix) => {
    if (!prefix) {
        cache.flushAll();
        return;
    }
    const keys = cache.keys();
    const matches = keys.filter(key => key.startsWith(prefix));
    if (matches.length > 0) {
        cache.del(matches);
    }
};

// Middleware for Express Routes
const cacheMiddleware = (duration) => (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = get(key);

    if (cachedResponse) {
        // Cache Hit
        return res.json(cachedResponse);
    } else {
        // Cache Miss - intercept res.json
        const originalSend = res.json;
        res.json = (body) => {
            set(key, body, duration);
            originalSend.call(res, body);
        };
        next();
    }
};

module.exports = {
    get,
    set,
    del,
    flush,
    cacheMiddleware
};
