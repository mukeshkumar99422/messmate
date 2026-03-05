const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, isAccountant } = require('../middlewares/authMiddleware');

const {
    fetchTodayMenu,
    fetchWeeklyMenu,
    updateTodayMenu,
    uploadWeeklyMenu,
    extractWeeklyMenuFromImage
} = require('../controllers/accountantController');

// Multer configuration: Store file in memory as a Buffer
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Protect all routes
router.use(protect, isAccountant);

// GET Routes
router.get('/menu/today', fetchTodayMenu);
router.get('/menu/weekly', fetchWeeklyMenu);

// POST/PUT Routes
router.put('/menu/today', updateTodayMenu);
router.post('/menu/weekly', uploadWeeklyMenu);

// AI Image Extraction Route (Expects a FormData field named 'image')
router.post('/menu/extract', upload.single('image'), extractWeeklyMenuFromImage);

module.exports = router;