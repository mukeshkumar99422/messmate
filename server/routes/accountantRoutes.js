const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, isAccountant } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { readLimiter, writeLimiter, aiHeavyLimiter } = require('../middlewares/rateLimiter');

const {
    updateTodayMenuSchema,
    uploadWeeklyMenuSchema,
    updateItemPriceSchema,
    reviewAnalysisQuerySchema,
} = require('../dtos/accountant/request.zod');

const {
    fetchTodayMenu,
    fetchWeeklyMenu,
    updateTodayMenu,
    updateItemPrice,
    uploadWeeklyMenu,
    extractWeeklyMenuFromImage,
    fetchOrGenerateReviewAnalysis
} = require('../controllers/accountantController');

const {cacheResponse, keys} = require('../middlewares/cacheMiddleware');

// Multer configuration: Store file in memory as a Buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Protect all routes
router.use(protect, isAccountant);

// GET Routes
router.get('/menu/today', readLimiter, 
    cacheResponse((req) => keys.menuToday(req.user.hostel.toString(), getISTDateString()), 120),
    fetchTodayMenu);
router.get('/menu/weekly', readLimiter, 
    cacheResponse((req) => keys.menuWeekly(req.user.hostel.toString()), 600),
    fetchWeeklyMenu);

// POST/PUT/PATCH Routes
router.put('/menu/today', writeLimiter, validate(updateTodayMenuSchema), updateTodayMenu);
router.patch('/item/price', writeLimiter, validate(updateItemPriceSchema), updateItemPrice);
router.post('/menu/weekly', writeLimiter, validate(uploadWeeklyMenuSchema), uploadWeeklyMenu);

// AI Image Extraction Route (Expects a FormData field named 'image')
// multipart body -> zod validates JSON shapes, not file buffers, so the
// multer file-type/size check stays exactly as-is here.
router.post('/menu/extract', aiHeavyLimiter, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'Invalid file upload' });
        }
        next();
    });
}, extractWeeklyMenuFromImage);

// reviews analysis route
router.get('/reviews/analyse', aiHeavyLimiter, validate(reviewAnalysisQuerySchema, 'query'), fetchOrGenerateReviewAnalysis);

module.exports = router;