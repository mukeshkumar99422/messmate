const { redisClient } = require('../config/redis');
const chalk = require('chalk');
const AppError = require('../utils/appError');

const PREFIX = 'idem';
const LOCK_TTL = 30;               // max seconds a request may stay "processing"
const RESULT_TTL = 24 * 60 * 60;   // how long a completed response is replay-able

const buildKey = (routeTag, userId, clientKey) => `${PREFIX}:${routeTag}:${userId}:${clientKey}`;

/**
 * Idempotency guard for write routes.
 * Client must send an `Idempotency-Key`
 * @param {string} routeTag - unique short tag for thiheader (UUID recommended).s route, e.g. 'purchase', 'rate'
 * @param {{required?: boolean}} [opts]
 */
const idempotent = (routeTag, { required = true } = {}) => async (req, res, next) => {
    const clientKey = req.headers['idempotency-key'];

    if (!clientKey) {
        if (required) {
            return next(new AppError('Idempotency-Key header is required', 400, 'IDEMPOTENCY_KEY_REQUIRED'));
        }
        return next();
    }
    if (typeof clientKey !== 'string' || clientKey.length < 8 || clientKey.length > 128) {
        return next(new AppError('Invalid Idempotency-Key', 400, 'INVALID_IDEMPOTENCY_KEY'));
    }

    const userId = req.user?._id?.toString() || 'anon';
    const key = buildKey(routeTag, userId, clientKey);

    try {
        // Atomic lock acquisition
        const acquired = await redisClient.set(key, { status: 'processing' }, { nx: true, ex: LOCK_TTL });

        if (!acquired) {
            const existing = await redisClient.get(key);
            if (!existing) return next(); // expired mid-race, safe to just proceed

            if (existing.status === 'processing') {
                return next(new AppError(
                    'An identical request is already being processed. Please retry shortly.',
                    409,
                    'REQUEST_IN_PROGRESS'
                ));
            }
            if (existing.status === 'completed') {
                res.setHeader('X-Idempotent-Replay', 'true');
                return res.status(existing.statusCode || 200).json(existing.body);
            }
        }

        // We hold the lock — wrap res.json to persist the outcome
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            const statusCode = res.statusCode;
            if (statusCode >= 200 && statusCode < 300) {
                redisClient.set(key, { status: 'completed', statusCode, body }, { ex: RESULT_TTL })
                    .catch(err => console.error(chalk.red(`[Idempotency] SET failed (${key}):`), err.message));
            } else {
                // failed attempt — free the key so the client can genuinely retry
                redisClient.del(key)
                    .catch(err => console.error(chalk.red(`[Idempotency] DEL failed (${key}):`), err.message));
            }
            return originalJson(body);
        };

        next();
    } catch (err) {
        // Redis outage — fail open rather than blocking all writes
        console.error(chalk.red('[Idempotency] Redis error, failing open:'), err.message);
        next();
    }
};

module.exports = { idempotent };