const WeeklyMenu = require('../models/WeeklyMenu');
const DailyMenu = require('../models/DailyMenu');
const Rating = require('../models/Rating');
const ReviewAnalysis = require('../models/ReviewAnalysis');
// const { redisClient } = require('../config/redis');
// const { clearCacheByPattern } = require('../utils/cacheUtils');
const {getISTDateString, getDayOfWeek} = require('../utils/helpers');
const GeminiService = require('../utils/generateAiContent');


// ==========================================
// 1. FETCH TODAY'S MENU
// ==========================================
const fetchTodayMenu = async (req, res) => {
    const today = getISTDateString();
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
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 2. FETCH WEEKLY MENU
// ==========================================
const fetchWeeklyMenu = async (req, res) => {
    try {
        const weeklyMenu = await WeeklyMenu.findOne({ hostel: req.user.hostel });
        if (!weeklyMenu) return res.status(404).json({ message: 'Weekly menu not found' });
        
        res.json(weeklyMenu);
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 3. UPDATE TODAY'S MENU (Specific Meal)
// ==========================================
const updateTodayMenu = async (req, res) => {
    const { date, meal, time, diet, extras } = req.body;

    try {
        // Upsert: Update if exists, Create if it doesn't
        const updatedDailyMenu = await DailyMenu.findOneAndUpdate(
            { hostel: req.user.hostel, date: date }, // Find by hostel and date
            { 
                $set: { 
                    [`${meal}`]: { time, diet, extras, updated: true } 
                } 
            },
            { new: true, upsert: true } // Upsert is the magic keyword!
        );

        // Clean out cache instantly so subsequent requests fall back to MongoDB
        // if (redisClient.isReady) {
        //     await redisClient.del(`hostel:${req.user.hostel}:daily:today`);
        // }

        res.json({ message: `${meal} menu updated successfully`, menu: updatedDailyMenu });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 4. UPLOAD/UPDATE ENTIRE WEEKLY MENU
// ==========================================
const uploadWeeklyMenu = async (req, res) => {
    const data = req.body; // Expecting the full { monday: {...}, tuesday: {...} } object

    try {
        const updatedWeeklyMenu = await WeeklyMenu.findOneAndUpdate(
            { hostel: req.user.hostel },
            { 
                $set: { 
                    menu: data, 
                    updatedOn: new Date() 
                } 
            },
            { new: true, upsert: true }
        );

        // // --- CRITICAL CACHE EVICTION INVOCATION ---
        // const hostelObjectId = req.user.hostel.toString();

        // // Evict all 7 days of the cached weekly menu (e.g., hostel:XYZ:weekly:monday, etc.)
        // await clearCacheByPattern(`hostel:${hostelObjectId}:weekly:*`);

        // // Also evict today's dynamic menu fallback cache just to be absolutely safe
        // if (redisClient.isReady) {
        //     await redisClient.del(`hostel:${hostelObjectId}:daily:today`);
        // }

        res.json({ message: 'Weekly menu updated successfully', menu: updatedWeeklyMenu });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 5. EXTRACT WEEKLY MENU FROM IMAGE (GEMINI)
// ==========================================
const extractWeeklyMenuFromImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image provided" });
        }

        const extractedMenu = await GeminiService.extractMenuFromImage(
            req.file.buffer,
            req.file.mimetype || 'image/jpeg'
        );
        
        res.json(extractedMenu);
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ message: "Failed to parse image.", error: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 5. Analyse reviews/ratings by students
// ==========================================
const fetchOrGenerateReviewAnalysis = async (req, res) => {
    // Determine flag if the client requested an explicit overwrite bypass
    const forceFresh = req.query.fresh === 'true';

    try {
        const hostelId = req.user.hostel;

        // 1. If not a forced fresh analysis, attempt an immediate cache lookup from DB
        if (!forceFresh) {
            const existingAnalysis = await ReviewAnalysis.findOne({ hostel: hostelId });
            if (existingAnalysis) {
                return res.status(200).json({ 
                    hasData: true, 
                    analysis: existingAnalysis 
                });
            }
        }

        // 2. no analysis data/forced refresh: Query standard raw records from the past 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeReviews = await Rating.find({
            hostel: hostelId,
            createdAt: { $gte: sevenDaysAgo }
        }).select('itemName itemType meal rating tags suggestion').lean();

        // 3. Fallback check: If there are absolutely no reviews, skip the AI entirely
        if (!activeReviews || activeReviews.length === 0) {
            return res.status(200).json({
                hasData: false,
                message: "No student reviews are currently available for your hostel facility."
            });
        }

        // 4. Run AI analytical pipelines
        const rawReport = await GeminiService.analyzeReviewsPayload(activeReviews);

        // 5. Commit payload directly to MongoDB using an atomic Upsert update flag
        const compiledRecord = await ReviewAnalysis.findOneAndUpdate(
            { hostel: hostelId },
            {
                $set: {
                    totalReviewsAnalyzed: activeReviews.length,
                    lastAnalyzedAt: new Date(),
                    topComplimentedItems: rawReport.topComplimentedItems,
                    topComplainedItems: rawReport.topComplainedItems,
                    completelyReplaceOrRemove: rawReport.completelyReplaceOrRemove,
                    needsBetterManagement: rawReport.needsBetterManagement
                }
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ 
            hasData: true, 
            analysis: compiledRecord 
        });

    } catch (error) {
        res.status(500).json({ 
            message: error.message.toString().length > 70 ? "Server Error" : error.message 
        });
    }
};

module.exports = {
    fetchTodayMenu,
    fetchWeeklyMenu,
    updateTodayMenu,
    uploadWeeklyMenu,
    extractWeeklyMenuFromImage,
    fetchOrGenerateReviewAnalysis
};