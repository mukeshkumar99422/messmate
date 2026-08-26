const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { readLimiter, adminWriteLimiter, emailSendLimiter } = require('../middlewares/rateLimiter');

const {
    createHostelSchema,
    updateHostelSchema,
    hostelIdAsIdParamSchema,
    hostelIdParamSchema,
    batchRemovalBodySchema,
    hostelRemovalBodySchema,
} = require('../dtos/admin/request.zod');

const {
    getAllHostelsAdmin,
    addHostel,
    updateHostelDetails,
    sendRemoveHostelOtp,
    removeHostel,
    fetchStudentsByHostel,
    sendRemoveAccountsOtp,
    removeAccounts,
} = require('../controllers/adminController');

const {cacheResponse, keys } = require('../middlewares/cacheMiddleware');
const {idempotent} = require('../middlewares/idempotencyMiddleware');



// Apply the protect and isAdmin middlewares to ALL routes in this file.
router.use(protect, isAdmin);

// Hostel management Routes
router.get('/hostels', readLimiter, cacheResponse(()=>keys.hostelsAdminList(),60), getAllHostelsAdmin);
router.post('/hostels', adminWriteLimiter, validate(createHostelSchema), idempotent('add-hostel'), addHostel);
router.put('/hostels/:id', adminWriteLimiter, validate(hostelIdAsIdParamSchema, 'params'), validate(updateHostelSchema), updateHostelDetails);
router.post('/hostels/:hostelId/remove/send-otp', emailSendLimiter, validate(hostelIdParamSchema, 'params'), sendRemoveHostelOtp);
router.delete('/hostels/:hostelId/remove', adminWriteLimiter, validate(hostelIdParamSchema, 'params'), validate(hostelRemovalBodySchema), removeHostel);

// Student Management Routes
router.get('/hostels/:hostelId/students', readLimiter, validate(hostelIdParamSchema, 'params'), fetchStudentsByHostel);
router.post('/hostels/:hostelId/students/remove/send-otp',emailSendLimiter, validate(hostelIdParamSchema, 'params'),sendRemoveAccountsOtp);
router.delete('/hostels/:hostelId/students/remove', adminWriteLimiter, validate(hostelIdParamSchema, 'params'), validate(batchRemovalBodySchema), removeAccounts);
 
module.exports = router;