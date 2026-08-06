require('dotenv').config();
const express = require('express');
const chalk = require('chalk');

// Initializes and logs Redis client connection
require('./config/redis');

const app = express();

// Health check / uptime ping target
app.get('/', (req, res) => {
    res.send('MessMate Email Worker is alive.');
});

// Job routes (QStash delivers here)
app.use('/api/jobs', require('./routes/jobRoutes'));

// Not found
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(chalk.blue(`Email worker running on port ${PORT}`));
});

module.exports = app;