const express = require('express');
const router = express.Router();
const { protect, isStudent } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { readLimiter, writeLimiter } = require('../middlewares/rateLimiter');

const {
    changeHostelSchema,
    dayParamSchema,
    extrasQuerySchema,
    addExtraPurchaseSchema,
    analyseExtraQuerySchema,
    addRatingSchema,
} = require('../dtos/student/request.zod');

const {
    changeHostel,
    fetchTodayMenu,
    fetchMenuByDay,
    fetchExtrasByDate,
    addExtraPurchase,
    fetchAnalyseExtra,
    addRating,
} = require('../controllers/studentController');
const { cacheResponse, keys } = require('../middlewares/cacheMiddleware');
const { getISTDateString } = require('../utils/helpers');
const {idempotent } = require('../middlewares/idempotencyMiddleware');

//protect and is student middlewares
router.use(protect, isStudent);

// 1. Change Hostel
router.put('/change-hostel', writeLimiter, validate(changeHostelSchema), idempotent('change-hostel'), changeHostel);

// 2. Fetch Today's Menu
router.get('/menu/today', readLimiter, 
    cacheResponse((req)=>keys.menuToday(req.user.hostel.toString(), getISTDateString()),120), 
    fetchTodayMenu);
 
// 3. Fetch Menu By Day
// Route: GET /api/student/menu/day/:day
router.get('/menu/day/:day', readLimiter, validate(dayParamSchema, 'params'), 
    cacheResponse((req) => keys.menuDay(req.user.hostel.toString(), req.params.day), 600),
    fetchMenuByDay);
 
// 4. Fetch Extras By Date & Meal
// Route: GET /api/student/extras?date=2026-02-25&meal=lunch
router.get('/extras', readLimiter, validate(extrasQuerySchema, 'query'), fetchExtrasByDate);
 
// 5. Add Extra Purchase
router.post('/purchase', writeLimiter, validate(addExtraPurchaseSchema), 
    idempotent('purchase'), 
    addExtraPurchase);

// 6. Fetch Analyse Extra (Purchase History)
// Route: GET /api/student/analyse-purchases?from=2026-02-01&to=2026-02-28
router.get('/analyse-purchases', writeLimiter, validate(analyseExtraQuerySchema, 'query'), fetchAnalyseExtra);

// 7. Add rating
router.post('/rate', writeLimiter, validate(addRatingSchema), idempotent('rate'), addRating);

module.exports = router;