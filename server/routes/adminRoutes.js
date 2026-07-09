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

const {validateHostelPayload, validateBatchRemoval} = require('../middlewares/adminValidationMiddleware');

// Apply the protect and isAdmin middlewares to ALL routes in this file.
router.use(protect, isAdmin);

// Hostel Routes
router.get('/hostels', getAllHostelsAdmin);
router.post('/hostels', validateHostelPayload, addHostel);
router.put('/hostels/:id',validateHostelPayload, updateHostelDetails);

// Student Management Routes
router.get('/hostels/:hostelId/students', fetchStudentsByHostel);
router.delete('/hostels/:hostelId/students/remove',validateBatchRemoval, removeAccounts);

module.exports = router;