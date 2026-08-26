// THIS REDIS SESSION IS ONLY FOR HANDLING REFRESH/SESSION TOKEN
const { redisClient } = require('../../config/redis');
const crypto = require('crypto');
const SESSION_TTL = 3 * 24 * 60 * 60;
const sessionKey = (token) => `session:${token}`;
const userSessionsKey = (userId) => `user:sessions:${userId}`;

/**
 * generate a new session
 * @param {ObjectId} userId 
 * @param {string} token 
 */
const createSession = async (userId, token) => {
    await redisClient.set(sessionKey(token), userId, { ex: SESSION_TTL });
    await redisClient.sadd(userSessionsKey(userId), token);
    await redisClient.expire(userSessionsKey(userId), SESSION_TTL);
};

/**
 * rotate refresh key
 * @param {ObjectId} userId 
 * @param {string} oldToken 
 * @param {string} newToken 
 */
const rotateSession = async (userId, oldToken, newToken) => {
    //delete old
    await redisClient.del(sessionKey(oldToken));
    await redisClient.srem(userSessionsKey(userId), oldToken);
    //add new
    redisClient.set(sessionKey(newToken), userId, {ex: SESSION_TTL});
    redisClient.sadd(userSessionsKey(userId), newToken);
    await redisClient.expire(userSessionsKey(userId), SESSION_TTL);
}

/**
 * @param {string} token 
 * @returns userId, or null if invalid/expired 
 */
const getSessionUser = async (token) => {
    return await redisClient.get(sessionKey(token));
};

/**
 * Sliding expiry: call on refresh/getMe so active devices don't expire mid-use
 * @param {string} token 
 * @param {ObjectId} userId
 */
const touchSession = async (token, userId) => {
    await redisClient.expire(sessionKey(token), SESSION_TTL);
    await redisClient.expire(userSessionsKey(userId), SESSION_TTL);
};

/**
 * Single-device logout
 * @param {ObjectId} userId 
 * @param {string} token 
 */
const revokeSession = async (userId, token) => {
    await redisClient.del(sessionKey(token));
    await redisClient.srem(userSessionsKey(userId), token);
};

/**
 * Logout everywhere (password-change/password-reset/theft-detection)
 * @param {ObjectId} userId 
 */
const revokeAllSessions = async (userId) => {
    const tokens = await redisClient.smembers(userSessionsKey(userId));
    if (tokens && tokens.length) {
        await redisClient.del(...tokens.map(sessionKey));
    }
    await redisClient.del(userSessionsKey(userId));
};

/**
 * Lazy cleanup: drop index entries whose actual session key already died
 * @param {ObjectId} userId 
 * @returns 
 */
const pruneExpiredSessions = async (userId) => {
    const tokens = await redisClient.smembers(userSessionsKey(userId));
    if (!tokens || !tokens.length) return;

    const values = await redisClient.mget(...tokens.map(sessionKey));
    const dead = tokens.filter((_, i) => values[i] === null || values[i] === undefined);
    if (dead.length) await redisClient.srem(userSessionsKey(userId), ...dead);
};

module.exports = {
    createSession,
    getSessionUser,
    rotateSession,
    touchSession,
    revokeSession,
    revokeAllSessions,
    pruneExpiredSessions,
};