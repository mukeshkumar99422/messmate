const { redisClient } = require('../config/redis');

/**
 * Safely evicts all Redis keys matching a specific pattern using a non-blocking SCAN iterator.
 * @param {string} pattern - The Redis glob pattern to match (e.g., "hostel:123:weekly:*").
 */
const clearCacheByPattern = async (pattern) => {
    if (!redisClient.isReady) return;

    try {
        let deletedCount = 0;
        
        // Latest Node-Redis syntax handles cursor management automatically via scanIterator
        for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
            await redisClient.del(key);
            deletedCount++;
        }
        
        console.log(`🧹 Redis Eviction: Cleared ${deletedCount} keys matching pattern [${pattern}]`);
    } catch (error) {
        console.error("❌ Failed to execute pattern eviction in Redis:", error);
    }
};

module.exports = { clearCacheByPattern };