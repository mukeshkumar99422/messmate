const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { readLimiter, adminWriteLimiter } = require('../middlewares/rateLimiter');

const {
    createHostelSchema,
    updateHostelSchema,
    hostelIdAsIdParamSchema,
    hostelIdParamSchema,
    batchRemovalBodySchema,
} = require('../dtos/admin/request.zod');

const {
    getAllHostelsAdmin,
    addHostel,
    updateHostelDetails,
    fetchStudentsByHostel,
    removeAccounts
} = require('../controllers/adminController');

const {cacheResponse, keys } = require('../middlewares/cacheMiddleware');



// Apply the protect and isAdmin middlewares to ALL routes in this file.
router.use(protect, isAdmin);

// Hostel Routes
router.get('/hostels', readLimiter, cacheResponse(()=>keys.hostelsAdminList(),60), getAllHostelsAdmin);
router.post('/hostels', adminWriteLimiter, validate(createHostelSchema), addHostel);
router.put('/hostels/:id', adminWriteLimiter, validate(hostelIdAsIdParamSchema, 'params'), validate(updateHostelSchema), updateHostelDetails);
 
// Student Management Routes
router.get('/hostels/:hostelId/students', readLimiter, validate(hostelIdParamSchema, 'params'), fetchStudentsByHostel);
router.delete('/hostels/:hostelId/students/remove', adminWriteLimiter, validate(hostelIdParamSchema, 'params'), validate(batchRemovalBodySchema), removeAccounts);
 
module.exports = router;