const { Redis } = require('@upstash/redis');
const chalk = require('chalk');

/**
 * Instantiate the connectionless HTTP client.
 * Using native global fetch allows this to seamlessly scale across Vercel Node runtimes.
 */
const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log(chalk.green('⚡ Serverless Upstash HTTP REST Client Initialized successfully.'));

module.exports = { redisClient };