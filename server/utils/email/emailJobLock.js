// DEDUPLICATION: 
// insert only not processed jobs into queue 
// already done in using deduplicationId in qstashClient.publishJSON

// IDEMPOTENCY:
// process only not processed jobs
// extra security: to avoid resending same email, during retrying when <server fails to send job done resoponse to qstash, but already sent mail>
// achieved using locks implemented in redis


const { redisClient } = require("../../config/redis");
const LOCK_PREFIX = "email-job:lock:";
const DONE_PREFIX = "email-job:done:";

/**
 * Acquires lock for a job
 * @param {*} jobId 
 * @returns {"done"|"processing"|"acquired"}
 */
const acquireJob = async (jobId) => {
    // Has this job already completed?
    const alreadyDone = await redisClient.get(`${DONE_PREFIX}${jobId}`);

    if (alreadyDone) return "done";

    // Try acquiring a processing lock
    const locked = await redisClient.set(
        `${LOCK_PREFIX}${jobId}`,
        "processing",
        {
            nx: true,
            ex: 300, // 5 minutes
        }
    );

    return locked ? "acquired" : "processing";
};

/**
 * Completes a job and marks it as done
 * @param {*} jobId 
 */
const completeJob = async (jobId) => {
    // Remove processing lock
    await redisClient.del(`${LOCK_PREFIX}${jobId}`);

    // Mark completed for 24 hours
    await redisClient.set(
        `${DONE_PREFIX}${jobId}`,
        "done",
        {
          ex: 60 * 60 * 24,
        }
    );
};

/**
 * Releases the lock for a job
 * @param {*} jobId 
 */
const releaseJob = async (jobId) => {
    await redisClient.del(`${LOCK_PREFIX}${jobId}`);
};

module.exports = {
    acquireJob,
    completeJob,
    releaseJob,
};