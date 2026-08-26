const { redisClient } = require('../config/redis');
const chalk = require('chalk');

const CACHE_PREFIX = 'cache';

/**
 * Read-through cache for GET routes.
 * @param {(req) => string|null} keyFn - return null to skip caching this request
 * @param {number} ttlSeconds
 */
const cacheResponse = (keyFn, ttlSeconds) => async (req, res, next) => {
  let key;
  try {
      key = keyFn(req);
  } catch {
      return next(); // not able to build a key (e.g. req.user missing) -> just skip caching
  }
  if (!key) return next();

  // CACHE HIT
  try {
      const cached = await redisClient.get(key);
      if (cached !== null && cached !== undefined) {
          res.setHeader('X-Cache', 'HIT');
          return res.status(200).json(cached);
      }
  } catch (err) {
      console.error(chalk.red(`[Cache] GET failed (${key}):`), err.message);
  }


  // CACHE MISS
  const originalJson = res.json.bind(res); //GRAB ORIGINAL RES.JSON() FN (.bind(res): this keyword refer to original res, in the copy of res.json())

  res.json = (body) => { //OVERRIDE RES.JSON() FN WITH CUSTOM LOGIC
    //CACHE SET LOGIC
    res.setHeader('X-Cache', 'MISS');
    if (res.statusCode >= 200 && res.statusCode < 300) {
        redisClient.set(key, body, { ex: ttlSeconds }).catch(err =>
            console.error(chalk.red(`[Cache] SET failed (${key}):`), err.message)
        );
    }

    //ORIGINAL LOGIC
    return originalJson(body); 
  };

  next();
};

/**
 * Delete exact keys after a successful mutation.
 */
const invalidateKeys = async (...keys) => {
    const flat = keys.flat().filter(Boolean);
    if (!flat.length) return;
    try {
        await redisClient.del(...flat);
    } catch (err) {
        console.error(chalk.red('[Cache] DEL failed:'), err.message, flat);
    }
};

/**
 * Delete every key matching a prefix pattern (used when a write can affect
 * many cached views at once, e.g. an item price change).
 */
const invalidatePattern = async (pattern) => {
    try {
        const matched = await redisClient.keys(pattern);
        if (matched.length) await redisClient.del(...matched);
    } catch (err) {
        console.error(chalk.red(`[Cache] Pattern invalidation failed (${pattern}):`), err.message);
    }
};

//key builders
const keys = {
    hostelsPublicList: () => `${CACHE_PREFIX}:hostels:public`,
    hostelsAdminList:  () => `${CACHE_PREFIX}:hostels:admin`,

    menuToday:  (hostelId, date) => `${CACHE_PREFIX}:menu:${hostelId}:today:${date}`,
    menuWeekly: (hostelId)       => `${CACHE_PREFIX}:menu:${hostelId}:weekly`,
    menuDay:    (hostelId, day)  => `${CACHE_PREFIX}:menu:${hostelId}:day:${day}`,
    extras:     (hostelId, date, meal) => `${CACHE_PREFIX}:extras:${hostelId}:${date}:${meal}`,

    menuAllPattern:   (hostelId) => `${CACHE_PREFIX}:menu:${hostelId}:*`,
    extrasAllPattern: (hostelId) => `${CACHE_PREFIX}:extras:${hostelId}:*`,
};

module.exports = { cacheResponse, invalidateKeys, invalidatePattern, keys };