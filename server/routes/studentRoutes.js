const express = require('express');
const router = express.Router();
const { protect, isStudent } = require('../middlewares/authMiddleware');
// const cacheInterceptor = require('../middlewares/cacheMiddleware');

const {
    changeHostel,
    fetchTodayMenu,
    fetchMenuByDay,
    fetchExtrasByDate,
    addExtraPurchase,
    fetchAnalyseExtra,
    addRating,
} = require('../controllers/studentController');

const {validateExtraPurchase, validateRatingSubmission} = require('../middlewares/StudentValidationMiddleware');

//protect and is student middlewares
router.use(protect, isStudent);


// 1. Change Hostel
// Route: PUT /api/student/change-hostel
router.put('/change-hostel', changeHostel);

// 2. Fetch Today's Menu
// Route: GET /api/student/menu/today
// caching data with key: <hostel,today> for 5 minutes
router.get(
    '/menu/today', 
    // cacheInterceptor((req) => `hostel:${req.user.hostel}:daily:today`, 300),
    fetchTodayMenu
);

// 3. Fetch Menu By Day
// Route: GET /api/student/menu/day/:day (e.g., /api/student/menu/day/monday)
// caching data with: <hostel,day> for 1 hour
router.get(
    '/menu/day/:day', 
    // cacheInterceptor((req) => `hostel:${req.user.hostel}:weekly:${req.params.day.toLowerCase()}`, 3600),
    fetchMenuByDay
);

// 4. Fetch Extras By Date & Meal
// Route: GET /api/student/extras?date=2026-02-25&meal=lunch
router.get('/extras', fetchExtrasByDate);

// 5. Add Extra Purchase
// Route: POST /api/student/purchase
router.post('/purchase', validateExtraPurchase, addExtraPurchase);

// 6. Fetch Analyse Extra (Purchase History)
// Route: GET /api/student/analyse-purchases?from=2026-02-01&to=2026-02-28
router.get('/analyse-purchases', fetchAnalyseExtra);

// 7. Add rating
// Route: POST /api/student/rate
router.post('/rate', validateRatingSubmission, addRating);

module.exports = router;