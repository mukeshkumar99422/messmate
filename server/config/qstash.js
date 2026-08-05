// config/qstash.js
const { Client } = require('@upstash/qstash');

const qstashClient = new Client({
    token: process.env.QSTASH_TOKEN,
});

module.exports = { qstashClient };