const User = require('../models/User');
const Hostel = require('../models/Hostel');
const WeeklyMenu = require('../models/WeeklyMenu');
const DailyMenu = require('../models/DailyMenu');
const Purchase = require('../models/Purchase');
const Rating = require('../models/Rating');

const {getDayOfWeek,validateDate,getISTDateString} = require('../utils/helpers');


// ==========================================
// 1. CHANGE HOSTEL
// ==========================================
const changeHostel = async (req, res) => {
    console.log(6);
    const newHostelId = Number(req.body.newHostelId);
    try {
        const oldHostelId = req.user.hostel; //objectId
        const targetHostel = await Hostel.findOne({ id: newHostelId });
        if(!targetHostel) {
            res.status(400).json({message: "Target hostel not found"});
        }

        const user = await User.findByIdAndUpdate(
            req.user._id, 
            { hostel: targetHostel._id },
            { new: true }
        ).populate('hostel', 'name id');

        // update students count in hostels
        await Hostel.findByIdAndUpdate(oldHostelId, { $inc: { studentCount: -1 } });
        await Hostel.findByIdAndUpdate(targetHostel._id, { $inc: { studentCount: 1 } });

        res.json({ message: "Hostel updated", hostelId: user.hostel.id, hostelName: user.hostel.name });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 2. FETCH TODAY'S MENU (Merge Daily & Weekly)
// ==========================================
const fetchTodayMenu = async (req, res) => {
    const today = getISTDateString();
    const dayOfWeek = getDayOfWeek(today);

    try {
        const weeklyMenuDoc = await WeeklyMenu.findOne({ hostel: req.user.hostel }).lean();
        const dailyMenuDoc = await DailyMenu.findOne({ hostel: req.user.hostel, date: today }).lean();

        // Fallback to empty structure if no standard menu is found
        const standardMenu = weeklyMenuDoc ? weeklyMenuDoc.menu[dayOfWeek] : { breakfast: null, lunch: null, dinner: null };
        const updatedMenu = dailyMenuDoc || {};

        const meals = ['breakfast', 'lunch', 'dinner'];
        const finalMenu = {};

        meals.forEach((meal) => {
            // If the accountant updated this specific meal for today, use it
            if (updatedMenu[meal] && updatedMenu[meal].updated) {
                finalMenu[meal] = { ...updatedMenu[meal], updated: true };
            } else {
                // Otherwise, use the standard 7-day menu
                finalMenu[meal] = { ...standardMenu[meal], updated: false };
            }
        });

        res.json(finalMenu);
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 3. FETCH MENU BY DAY (e.g., "monday")
// ==========================================
const fetchMenuByDay = async (req, res) => {
    const day = String(req.params.day || '').trim();

    try {
        const weeklyMenuDoc = await WeeklyMenu.findOne({ hostel: req.user.hostel }).lean();
        
        if (!weeklyMenuDoc || !weeklyMenuDoc.menu[day]) {
            return res.status(404).json({ message: 'Menu not found for this day' });
        }

        res.json({ day, ...weeklyMenuDoc.menu[day] });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 4. FETCH EXTRAS BY DATE & MEAL
// ==========================================
const fetchExtrasByDate = async (req, res) => {
    const date = String(req.query.date || '').trim();
    const meal = String(req.query.meal || '').trim();
    
    try {
        if(!validateDate(date)) {
            return res.status(400).json({message: "Invalid date format"});
        }

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
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
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
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 6. FETCH ANALYSE EXTRA (Purchase History)
// ==========================================
const fetchAnalyseExtra = async (req, res) => {
    // Expecting from and to as query parameters (e.g., /api/student/analyse-purchases?from=2026-02-01&to=2026-02-28)
    const { from, to } = req.query;
    const cFrom = String(from || '').trim();
    const cTo = String(to || '').trim();

    if(cFrom && !validateDate(cFrom)) {
        return res.status(400).json({message: "Please provide a valid from date"});
    }
    if(cTo && !validateDate(cTo)) {
        return res.status(400).json({message: "Please provide a valid from date"});
    }

    try {
        // Start building the MongoDB query
        const query = { student: req.user._id };

        // If 'from' or 'to' is provided, add them to the query
        if (cFrom || cTo) {
            query.date = {};
            
            // $gte means "greater than or equal to"
            if (cFrom) query.date.$gte = cFrom;
            
            // $lte means "less than or equal to"
            if (cTo) query.date.$lte = cTo;
        }

        // Sorting by 'date' descending first, then 'createdAt' as a fallback
        const purchases = await Purchase.find(query)
            .sort({ date: -1, createdAt: -1 }).lean();

        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 7. Add Rating
// ==========================================
const addRating = async (req,res)=>{
    const { itemName, itemType, meal, rating, tags, suggestion } = req.body;
    const user = req.user._id;
    const hostel = req.user.hostel;

    // console.log("Adding rating:", { user, hostel, itemName, itemType, meal, rating, tags, suggestion });
    try {
        const newRating = await Rating.create({
            student: user,
            hostel: hostel,
            itemName,
            itemType,
            meal,
            rating,
            tags,
            suggestion
        })
        res.status(201).json({message: "Rating added successfully", rating: newRating});
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 100 ? "Server Error" : error.message });
    }
}


module.exports = {
    changeHostel,
    fetchTodayMenu,
    fetchMenuByDay,
    fetchExtrasByDate,
    addExtraPurchase,
    fetchAnalyseExtra,
    addRating
};