const User = require('../models/User');
const Hostel = require('../models/Hostel');
const WeeklyMenu = require('../models/WeeklyMenu');
const DailyMenu = require('../models/DailyMenu');
const Purchase = require('../models/Purchase');
const Rating = require('../models/Rating');
const Item = require('../models/Item');

const { getDayOfWeek, getISTDateString, canPurchaseMeal } = require('../utils/helpers');
const { MenuResponseDTO, DayMenuResponseDTO } = require('../dtos/common/menu.response.dto');
const { PurchaseResponseDTO, RatingResponseDTO, ExtrasListResponseDTO, AnalysePurchasesResponseDTO } = require('../dtos/student/response.dto');
const AppError = require('../utils/appError');
const meals = ['breakfast', 'lunch', 'dinner'];

// ==========================================
// 1. CHANGE HOSTEL
// ==========================================
const changeHostel = async (req, res, next) => {
    const { newHostelId } = req.body;

    try {
        const oldHostelId = req.user.hostel; //objectId
        const targetHostel = await Hostel.findOne({ id: newHostelId });
        if (!targetHostel) {
            return next(new AppError("Target hostel not found",400));
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { hostel: targetHostel._id },
            { new: true }
        ).populate('hostel', 'name id');

        await Hostel.findByIdAndUpdate(oldHostelId, { $inc: { studentCount: -1 } });
        await Hostel.findByIdAndUpdate(targetHostel._id, { $inc: { studentCount: 1 } });

        res.json({ message: "Hostel updated", hostelId: user.hostel.id, hostelName: user.hostel.name });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2. FETCH TODAY'S MENU (Merge Daily & Weekly)
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
        next(error);
    }
};

// ==========================================
// 3. FETCH MENU BY DAY (e.g., "monday")
// ==========================================
const fetchMenuByDay = async (req, res, next) => {
    const { day } = req.params;

    try {
        const populatePaths = meals.flatMap(meal => [
            { path: `menu.${day}.${meal}.diet`, select: 'name' },
            { path: `menu.${day}.${meal}.extras`, select: 'name price' }
        ]);

        const weeklyMenuDoc = await WeeklyMenu.findOne({ hostel: req.user.hostel })
            .populate(populatePaths)
            .lean();

        if (!weeklyMenuDoc || !weeklyMenuDoc.menu[day]) {
            return next(new AppError('Menu not found for this day', 404));
        }

        res.json(DayMenuResponseDTO(day, weeklyMenuDoc.menu[day]));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4. FETCH EXTRAS BY DATE & MEAL
// ==========================================
const fetchExtrasByDate = async (req, res, next) => {
    const { date, meal } = req.query;

    try {
        const dayOfWeek = getDayOfWeek(date);

        const dailyMenuDoc = await DailyMenu.findOne({ hostel: req.user.hostel, date })
            .populate({ path: `${meal}.extras`, select: 'name price' })
            .lean();

        if (dailyMenuDoc && dailyMenuDoc[meal] && dailyMenuDoc[meal].updated) {
            return res.json(ExtrasListResponseDTO(dailyMenuDoc[meal].extras));
        }

        const weeklyMenuDoc = await WeeklyMenu.findOne({ hostel: req.user.hostel })
            .populate({ path: `menu.${dayOfWeek}.${meal}.extras`, select: 'name price' })
            .lean();

        if (weeklyMenuDoc && weeklyMenuDoc.menu[dayOfWeek] && weeklyMenuDoc.menu[dayOfWeek][meal]) {
            return res.json(ExtrasListResponseDTO(weeklyMenuDoc.menu[dayOfWeek][meal].extras));
        }

        res.json([]);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5. ADD EXTRA PURCHASE
// ==========================================
const addExtraPurchase = async (req, res, next) => {
    const { date, meal, items } = req.body;

    try {
        //check whether can purchase meal
        if(!canPurchaseMeal(date,meal)) {
            return next(new AppError(`You can purchase ${meal} items only after serving starts.`, 400));
        }

        let serverCalculatedTotal = 0;
        const verifiedPurchaseItems = [];

        const itemIds = items.map(i => i.itemId);

        const dbItems = await Item.find({
            _id: { $in: itemIds },
            hostel: req.user.hostel
        });

        const dbItemMap = {};
        dbItems.forEach(i => dbItemMap[i._id.toString()] = i);

        for (const clientItem of items) {
            const dbItem = dbItemMap[clientItem.itemId];

            if (!dbItem) {
                return next(new AppError('An item in your cart no longer exists.', 404));
            }
            if (dbItem.type !== 'extra') {
                return next(new AppError(`Item '${dbItem.name}' is a regular diet item, not an extra.`, 400));
            }

            const itemTotalCost = dbItem.price * clientItem.qty;
            serverCalculatedTotal += itemTotalCost;

            verifiedPurchaseItems.push({
                item: dbItem._id,
                name: dbItem.name,
                price: dbItem.price,
                qty: clientItem.qty
            });
        }

        const purchase = await Purchase.create({
            student: req.user._id,
            date,
            meal,
            items: verifiedPurchaseItems,
            totalAmount: serverCalculatedTotal
        });

        res.status(201).json({ message: 'Purchase logged securely', purchase: PurchaseResponseDTO(purchase) });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6. FETCH ANALYSE EXTRA (Server-Side Aggregation)
// ==========================================
const fetchAnalyseExtra = async (req, res, next) => {
    const { from, to, groupBy } = req.query;

    try {
        const matchStage = { student: req.user._id };
        if (from || to) {
            matchStage.date = {};
            if (from) matchStage.date.$gte = from;
            if (to) matchStage.date.$lte = to;
        }

        let trendGroupId = "$date";
        if (groupBy === 'monthly') {
            trendGroupId = { $substr: ["$date", 0, 7] };
        } else if (groupBy === 'weekly') {
            trendGroupId = {
                $let: {
                    vars: { dateObj: { $toDate: "$date" } },
                    in: { $concat: [{ $toString: { $isoWeekYear: "$$dateObj" } }, "-W", { $toString: { $isoWeek: "$$dateObj" } }] }
                }
            };
        }

        const result = await Purchase.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    totals: [
                        { $unwind: "$items" },
                        { $group: {
                            _id: null,
                            totalAmount: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
                            totalItems: { $sum: "$items.qty" }
                        }}
                    ],
                    uniqueDays: [
                        { $group: { _id: "$date" } },
                        { $count: "count" }
                    ],
                    meals: [
                        { $group: { _id: "$meal", amount: { $sum: "$totalAmount" } } }
                    ],
                    items: [
                        { $unwind: "$items" },
                        { $group: {
                            _id: "$items.name",
                            qty: { $sum: "$items.qty" },
                            amount: { $sum: { $multiply: ["$items.qty", "$items.price"] } }
                        }},
                        { $sort: { qty: -1 } }
                    ],
                    trend: [
                        { $group: {
                            _id: trendGroupId,
                            total: { $sum: "$totalAmount" }
                        }},
                        { $sort: { "_id": 1 } }
                    ]
                }
            }
        ]);

        const data = result[0];
        const totalAmount = data.totals[0]?.totalAmount || 0;
        const totalItems = data.totals[0]?.totalItems || 0;
        const uniqueDayCount = data.uniqueDays[0]?.count || 0;

        let topItems = data.items.slice(0, 7).map(i => ({ name: i._id, qty: i.qty, amount: i.amount }));
        if (data.items.length > 7) {
            const others = data.items.slice(7).reduce((acc, i) => {
                acc.qty += i.qty;
                acc.amount += i.amount;
                return acc;
            }, { name: "Others", qty: 0, amount: 0 });
            topItems.push(others);
        }

        const pie = data.meals.map(m => ({
            name: m._id.charAt(0).toUpperCase() + m._id.slice(1),
            value: m.amount
        }));

        res.json(AnalysePurchasesResponseDTO({
            totalAmount,
            totalItems,
            uniqueDayCount,
            pie,
            topItems,
            trend: data.trend,
        }));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 7. Add Rating
// ==========================================
const addRating = async (req, res, next) => {
    const { itemId, meal, rating, tags, suggestion } = req.body;
    const user = req.user._id;
    const hostel = req.user.hostel;

    try {
        const dbItem = await Item.findOne({ _id: itemId, hostel: hostel });

        if (!dbItem) {
            return next(new AppError('Item not found in catalog.', 404));
        }

        const newRating = await Rating.create({
            student: user,
            hostel: hostel,

            item: dbItem._id,
            itemName: dbItem.name,
            itemType: dbItem.type,
            meal,

            rating,
            tags,
            suggestion
        });

        res.status(201).json({ message: "Rating added successfully", rating: RatingResponseDTO(newRating) });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    changeHostel,
    fetchTodayMenu,
    fetchMenuByDay,
    fetchExtrasByDate,
    addExtraPurchase,
    fetchAnalyseExtra,
    addRating
};