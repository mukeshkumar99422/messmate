const { createClient } = require('redis');
const chalk = require('chalk');

// Instantiates client
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

// Event bindings as dictated by the client guidelines
redisClient.on('error', (err) => console.error(chalk.red('Redis Client Error:'), err));
redisClient.on('connect', () => console.log(chalk.blue('Redis Client initializing connection...')));
redisClient.on('ready', () => console.log(chalk.green('⚡ Redis Server Ready & Connected!')));

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

module.exports = { redisClient, connectRedis };