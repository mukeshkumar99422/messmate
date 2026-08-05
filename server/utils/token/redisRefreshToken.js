const { redisClient } = require('../../config/redis');

/**
 * Commits a logged-in user refresh session token string into Upstash Redis.
 * Expires automatically after 7 days (604800 seconds) to match JWT constraints.
 */
const saveUserSession = async (userId, token) => {
    const key = `sess:user:${userId}`;
    await redisClient.set(key, token, { ex: 7 * 24 * 60 * 60 });
};

/**
 * Reads the active valid refresh session string out of database storage.
 */
const getUserSession = async (userId) => {
    return await redisClient.get(`sess:user:${userId}`);
};

/**
 * Evicts a session string completely from storage (forces active signouts).
 */
const revokeUserSession = async (userId) => {
    await redisClient.del(`sess:user:${userId}`);
};

module.exports = {
    saveUserSession,
    getUserSession,
    revokeUserSession
};