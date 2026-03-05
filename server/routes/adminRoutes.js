const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');

const {
    getAllHostelsAdmin,
    addHostel,
    updateHostelDetails,
    fetchStudentsByHostel,
    removeAccounts
} = require('../controllers/adminController');

// Apply the protect and isAdmin middlewares to ALL routes in this file.
router.use(protect, isAdmin);

// Hostel Routes
router.get('/hostels', getAllHostelsAdmin);
router.post('/hostels', addHostel);
router.put('/hostels/:id', updateHostelDetails);

// Student Management Routes
router.get('/hostels/:hostelId/students', fetchStudentsByHostel);
router.delete('/students/remove', removeAccounts);

module.exports = router;