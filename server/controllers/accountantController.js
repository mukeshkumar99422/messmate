const WeeklyMenu = require('../models/WeeklyMenu');
const DailyMenu = require('../models/DailyMenu');
const Rating = require('../models/Rating');
const Item = require('../models/Item');

const ReviewAnalysis = require('../models/ReviewAnalysis');
const { getISTDateString, getDayOfWeek, getIdsFromItems } = require('../utils/helpers');
const GeminiService = require('../utils/generateAiContent');

const { MenuResponseDTO, WeeklyMenuResponseDTO } = require('../dtos/menu/response.dto');
const {
    DailyMenuUpdateResponseDTO,
    ItemResponseDTO,
    ReviewAnalysisResponseDTO,
} = require('../dtos/accountant/response.dto');

const { invalidateKeys, invalidatePattern, keys } = require('../middlewares/cacheMiddleware');

const AppError = require('../utils/appError');

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const meals = ['breakfast', 'lunch', 'dinner'];


// ==========================================
// 1. FETCH TODAY'S MENU
// ==========================================
const fetchTodayMenu = async (req, res, next) => {
    const today = getISTDateString();
    const dayOfWeek = getDayOfWeek(today);

    try {
        const weeklyPopulatePaths = meals.flatMap(meal => [
            { path: `menu.${dayOfWeek}.${meal}.diet`, select: 'name' },
            { path: `menu.${dayOfWeek}.${meal}.extras`, select: 'name price' }
        ]);

        const dailyPopulatePaths = meals.flatMap(meal => [
            { path: `${meal}.diet`, select: 'name' },
            { path: `${meal}.extras`, select: 'name price' }
        ]);

        const weeklyMenuDoc = await WeeklyMenu.findOne({ hostel: req.user.hostel })
            .populate(weeklyPopulatePaths)
            .lean();

        const dailyMenuDoc = await DailyMenu.findOne({ hostel: req.user.hostel, date: today })
            .populate(dailyPopulatePaths)
            .lean();

        const standardMenu = weeklyMenuDoc ? weeklyMenuDoc.menu[dayOfWeek] : { breakfast: null, lunch: null, dinner: null };
        const updatedMenu = dailyMenuDoc || {};

        const mergedMenu = {};
        meals.forEach((meal) => {
            if (updatedMenu[meal] && updatedMenu[meal].updated) {
                mergedMenu[meal] = updatedMenu[meal];
            } else if (standardMenu[meal]) {
                mergedMenu[meal] = standardMenu[meal];
            } else {
                mergedMenu[meal] = null;
            }
        });

        res.json(MenuResponseDTO(mergedMenu));
    } catch (error) {
        next(error)
    }
};

// ==========================================
// 2. FETCH WEEKLY MENU
// ==========================================
const fetchWeeklyMenu = async (req, res, next) => {
    try {
        const populatePaths = [];

        days.forEach(d => {
            meals.forEach(m => {
                populatePaths.push({ path: `menu.${d}.${m}.diet`, select: 'name' });
                populatePaths.push({ path: `menu.${d}.${m}.extras`, select: 'name price' });
            });
        });

        const weeklyMenu = await WeeklyMenu.findOne({ hostel: req.user.hostel })
            .populate(populatePaths)
            .lean();

        if (!weeklyMenu) return next(new AppError('Weekly menu not found', 404));

        res.json(WeeklyMenuResponseDTO(weeklyMenu));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3. UPDATE TODAY'S MENU (Specific Meal)
// ==========================================
const updateTodayMenu = async (req, res, next) => {
    const { date, meal, time, diet, extras } = req.body;
    const hostelId = req.user.hostel;

    try {
        const dietIds = await getIdsFromItems(diet, 'diet', hostelId);
        const extraIds = await getIdsFromItems(extras, 'extra', hostelId);

        const updatedDailyMenu = await DailyMenu.findOneAndUpdate(
            { hostel: hostelId, date: date },
            {
                $set: {
                    [`${meal}`]: {
                        time: time,
                        diet: dietIds,
                        extras: extraIds,
                        updated: true
                    }
                }
            },
            { returnDocument: 'after', upsert: true }
        );

        await invalidateKeys(keys.menuToday(hostelId.toString(), date));

        res.json({
            message: `${meal.charAt(0).toUpperCase() + meal.slice(1)} menu updated successfully`,
            menu: DailyMenuUpdateResponseDTO(updatedDailyMenu, meal)
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// QUICK UPDATE ITEM PRICE
// ==========================================
const updateItemPrice = async (req, res, next) => {
    const { itemId, newPrice } = req.body;

    try {
        const item = await Item.findOneAndUpdate(
            { _id: itemId, hostel: req.user.hostel },
            { $set: { price: newPrice } },
            { returnDocument: 'after' }
        );

        if (!item) {
            return next(new AppError('Item not found in your catalog.', 404));
        }

        await Promise.all([
            invalidatePattern(keys.menuAllPattern(req.user.hostel.toString())),
            invalidatePattern(keys.extrasAllPattern(req.user.hostel.toString())),
        ]);

        res.json({ message: 'Price updated globally successfully', item: ItemResponseDTO(item) });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4. UPLOAD/UPDATE ENTIRE WEEKLY MENU
// ==========================================
const uploadWeeklyMenu = async (req, res, next) => {
    const data = req.body;
    const hostelId = req.user.hostel;

    try {
        // 1. Soft-delete strategy: Deactivate ALL existing items for this hostel.
        await Item.updateMany({ hostel: hostelId }, { $set: { isActive: false } });

        // 2. add/activate items, replace object arrays with ID arrays
        for (const day of days) {
            for (const meal of meals) {
                const mealData = data[day][meal];

                const dietIds = await getIdsFromItems(mealData.diet, 'diet', hostelId);
                const extraIds = await getIdsFromItems(mealData.extras, 'extra', hostelId);

                data[day][meal].diet = dietIds;
                data[day][meal].extras = extraIds;
            }
        }

        // 3. Save the Weekly Menu with IDs
        const updatedWeeklyMenu = await WeeklyMenu.findOneAndUpdate(
            { hostel: hostelId },
            {
                $set: {
                    menu: data,
                    updatedOn: new Date()
                }
            },
            { returnDocument: 'after', upsert: true }
        );

        await Promise.all([
            invalidatePattern(keys.menuAllPattern(hostelId.toString())),
            invalidatePattern(keys.extrasAllPattern(hostelId.toString())),
        ]);

        res.json({ message: 'Weekly menu updated successfully', menu: WeeklyMenuResponseDTO(updatedWeeklyMenu) });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5. EXTRACT WEEKLY MENU FROM IMAGE (GEMINI)
// ==========================================
const extractWeeklyMenuFromImage = async (req, res, next) => {
    try {
        if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
            return next(new AppError('No image provided', 400));
        }

        const extractedMenu = await GeminiService.extractMenuFromImage(
            req.file.buffer,
            req.file.mimetype || 'image/jpeg'
        );

        // AI-generated JSON, no DB doc involved — nothing to wrap in a DTO.
        res.json(extractedMenu);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5. Analyse reviews/ratings by students
// ==========================================
const fetchOrGenerateReviewAnalysis = async (req, res, next) => {
    const { fresh: forceFresh } = req.query;

    try {
        const hostelId = req.user.hostel;

        if (!forceFresh) {
            const existingAnalysis = await ReviewAnalysis.findOne({ hostel: hostelId });
            if (existingAnalysis) {
                return res.status(200).json({
                    hasData: true,
                    analysis: ReviewAnalysisResponseDTO(existingAnalysis)
                });
            }
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeReviews = await Rating.find({
            hostel: hostelId,
            createdAt: { $gte: sevenDaysAgo }
        }).select('itemName itemType meal rating tags suggestion').lean();

        if (!activeReviews || activeReviews.length === 0) {
            return res.status(200).json({
                hasData: false,
                message: "No student reviews are currently available for your hostel facility."
            });
        }

        const rawReport = await GeminiService.analyzeReviewsPayload(activeReviews);

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
            { returnDocument: 'after', upsert: true }
        );

        res.status(200).json({
            hasData: true,
            analysis: ReviewAnalysisResponseDTO(compiledRecord)
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    fetchTodayMenu,
    fetchWeeklyMenu,
    updateTodayMenu,
    updateItemPrice,
    uploadWeeklyMenu,
    extractWeeklyMenuFromImage,
    fetchOrGenerateReviewAnalysis
};