const User = require('../models/User');
const WeeklyMenu = require('../models/WeeklyMenu');
const DailyMenu = require('../models/DailyMenu');
const Purchase = require('../models/Purchase');

// Helper to get the current day string (e.g., 'monday')
const getDayOfWeek = (dateString) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date = dateString ? new Date(dateString) : new Date();
    return days[date.getDay()];
};

// ==========================================
// 1. CHANGE HOSTEL
// ==========================================
const changeHostel = async (req, res) => {
    console.log(6);
    const { newHostelId } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id, 
            { hostel: newHostelId },
            { new: true }
        ).populate('hostel', 'name');

        res.json({ message: "Hostel updated", hostelId: user.hostel._id, hostelName: user.hostel.name });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 2. FETCH TODAY'S MENU (Merge Daily & Weekly)
// ==========================================
const fetchTodayMenu = async (req, res) => {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const dayOfWeek = getDayOfWeek(today);

    try {
        const weeklyMenuDoc = await WeeklyMenu.findOne({ hostel: req.user.hostel });
        const dailyMenuDoc = await DailyMenu.findOne({ hostel: req.user.hostel, date: today });

        // Fallback to empty structure if no standard menu is found
        const standardMenu = weeklyMenuDoc ? weeklyMenuDoc.menu[dayOfWeek] : { breakfast: null, lunch: null, dinner: null };
        const updatedMenu = dailyMenuDoc || {};

        const meals = ['breakfast', 'lunch', 'dinner'];
        const finalMenu = {};

        meals.forEach((meal) => {
            // If the accountant updated this specific meal for today, use it
            if (updatedMenu[meal] && updatedMenu[meal].updated) {
                finalMenu[meal] = { ...updatedMenu[meal]._doc, updated: true };
            } else {
                // Otherwise, use the standard 7-day menu
                finalMenu[meal] = { ...standardMenu[meal]?._doc, updated: false };
            }
        });

        res.json(finalMenu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 3. FETCH MENU BY DAY (e.g., "monday")
// ==========================================
const fetchMenuByDay = async (req, res) => {
    const { day } = req.params; // Expects "monday", "tuesday", etc.

    try {
        const weeklyMenuDoc = await WeeklyMenu.findOne({ hostel: req.user.hostel });
        
        if (!weeklyMenuDoc || !weeklyMenuDoc.menu[day]) {
            return res.status(404).json({ message: 'Menu not found for this day' });
        }

        res.json({ day, ...weeklyMenuDoc.menu[day]._doc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 4. FETCH EXTRAS BY DATE & MEAL
// ==========================================
const fetchExtrasByDate = async (req, res) => {
    const { date, meal } = req.query; // date: "YYYY-MM-DD", meal: "lunch"
    
    try {
        const dayOfWeek = getDayOfWeek(date);
        
        // Check Daily Menu first
        const dailyMenuDoc = await DailyMenu.findOne({ hostel: req.user.hostel, date });
        if (dailyMenuDoc && dailyMenuDoc[meal] && dailyMenuDoc[meal].updated) {
            return res.json(dailyMenuDoc[meal].extras || []);
        }

        // Fallback to Weekly Menu
        const weeklyMenuDoc = await WeeklyMenu.findOne({ hostel: req.user.hostel });
        if (weeklyMenuDoc && weeklyMenuDoc.menu[dayOfWeek] && weeklyMenuDoc.menu[dayOfWeek][meal]) {
            return res.json(weeklyMenuDoc.menu[dayOfWeek][meal].extras || []);
        }

        res.json([]); // Return empty array if no extras found
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 5. ADD EXTRA PURCHASE
// ==========================================
const addExtraPurchase = async (req, res) => {
    const { date, meal, items, totalAmount } = req.body;

    try {
        const purchase = await Purchase.create({
            student: req.user._id,
            date, 
            meal,
            items,
            totalAmount
        });

        res.status(201).json({ message: 'Purchase logged successfully', purchase });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 6. FETCH ANALYSE EXTRA (Purchase History)
// ==========================================
const fetchAnalyseExtra = async (req, res) => {
    // Expecting from and to as query parameters (e.g., /api/student/analyse-purchases?from=2026-02-01&to=2026-02-28)
    const { from, to } = req.query;

    try {
        // 1. Start building the MongoDB query
        const query = { student: req.user._id };

        // 2. If 'from' or 'to' is provided, add them to the query
        if (from || to) {
            query.date = {};
            
            // $gte means "greater than or equal to"
            if (from) query.date.$gte = from; 
            
            // $lte means "less than or equal to"
            if (to) query.date.$lte = to;     
        }

        // 3. Fetch the data directly from the database using the query
        // Sorting by 'date' descending first, then 'createdAt' as a fallback
        const purchases = await Purchase.find(query)
            .sort({ date: -1, createdAt: -1 }); 

        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    changeHostel,
    fetchTodayMenu,
    fetchMenuByDay,
    fetchExtrasByDate,
    addExtraPurchase,
    fetchAnalyseExtra
};