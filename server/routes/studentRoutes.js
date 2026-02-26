const express = require('express');
const router = express.Router();
const { protect, isStudent } = require('../middlewares/authMiddleware');

const {
    changeHostel,
    fetchTodayMenu,
    fetchMenuByDay,
    fetchExtrasByDate,
    addExtraPurchase,
    fetchAnalyseExtra
} = require('../controllers/studentController');

// ==========================================
// MIDDLEWARE
// ==========================================
router.use(protect, isStudent);

// ==========================================
// ROUTES
// ==========================================

// 1. Change Hostel
// Route: PUT /api/student/change-hostel
router.put('/change-hostel', changeHostel);

// 2. Fetch Today's Menu
// Route: GET /api/student/menu/today
router.get('/menu/today', fetchTodayMenu);

// 3. Fetch Menu By Day
// Route: GET /api/student/menu/day/:day (e.g., /api/student/menu/day/monday)
router.get('/menu/day/:day', fetchMenuByDay);

// 4. Fetch Extras By Date & Meal
// Route: GET /api/student/extras?date=2026-02-25&meal=lunch
router.get('/extras', fetchExtrasByDate);

// 5. Add Extra Purchase
// Route: POST /api/student/purchase
router.post('/purchase', addExtraPurchase);

// 6. Fetch Analyse Extra (Purchase History)
// Route: GET /api/student/analyse-purchases?from=2026-02-01&to=2026-02-28
router.get('/analyse-purchases', fetchAnalyseExtra);

module.exports = router;