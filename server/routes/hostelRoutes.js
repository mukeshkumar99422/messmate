const express = require('express');
const router = express.Router();
const { getAllHostels } = require('../controllers/hostelController');

// Route: GET /api/hostels
// Public route (No middleware needed here)
router.get('/', getAllHostels);

module.exports = router;