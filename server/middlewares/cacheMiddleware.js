const { redisClient } = require('../config/redis');

/**
 * Higher-order middleware factory for response intercept caching.
 * @param {Function} keyBuilder - Callback generating structural string keys.
 * @param {number} ttl - Time-To-Live expiration window in seconds.
 */
const cacheInterceptor = (keyBuilder, ttl = 300) => {
    return async (req, res, next) => {
        // Fall back silently to database lifecycle if Redis drops offline
        if (!redisClient.isReady) {
            return next();
        }

        try {
            const cacheKey = keyBuilder(req);
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                // Cache Hit! Parse stringified text and return directly
                return res.json(JSON.parse(cachedData));
            }

            // Cache Miss: Wrap res.json temporarily to intercept data on egress
            const originalJson = res.json;
            res.json = function (body) {
                if (res.statusCode === 200 && body) {
                    // Set key with integer expiration using the modern setEx method
                    redisClient.setEx(cacheKey, ttl, JSON.stringify(body))
                        .catch(err => console.error('Redis background set error:', err));
                }
                return originalJson.call(this, body);
            };

            next();
        } catch (error) {
            console.error("Cache Interceptor Exception:", error);
            next();
        }
    };
};

module.exports = cacheInterceptor;