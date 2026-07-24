const express = require('express');
const router = express.Router();
const { getAllHostels } = require('../controllers/hostelController');
const { publicReadLimiter } = require('../middlewares/rateLimiter');
const { cacheResponse, keys } = require('../middlewares/cacheMiddleware');
const {}

// Route: GET /api/hostels
router.get('/', publicReadLimiter, cacheResponse(()=> keys.hostelsPublicList(),3600), getAllHostels);

module.exports = router;