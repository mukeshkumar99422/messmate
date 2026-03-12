const WeeklyMenu = require('../models/WeeklyMenu');
const DailyMenu = require('../models/DailyMenu');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to get the current day string (e.g., 'monday')
const getDayOfWeek = (dateString) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date = dateString ? new Date(dateString) : new Date();
    return days[date.getDay()];
};

// ==========================================
// 1. FETCH TODAY'S MENU
// ==========================================
const fetchTodayMenu = async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = getDayOfWeek(today);

    try {
        const weeklyMenuDoc = await WeeklyMenu.findOne({ hostel: req.user.hostel }).lean();
        const dailyMenuDoc = await DailyMenu.findOne({ hostel: req.user.hostel, date: today }).lean();

        const standardMenu = weeklyMenuDoc ? weeklyMenuDoc.menu[dayOfWeek] : { breakfast: {}, lunch: {}, dinner: {} };
        const updatedMenu = dailyMenuDoc || {};

        const meals = ['breakfast', 'lunch', 'dinner'];
        const finalMenu = {};

        meals.forEach((meal) => {
            if (updatedMenu[meal] && updatedMenu[meal].updated) {
                finalMenu[meal] = { ...updatedMenu[meal], updated: true };
            } else {
                finalMenu[meal] = { ...standardMenu[meal], updated: false };
            }
        });

        res.json(finalMenu);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
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

        res.json({ message: `${meal} menu updated successfully`, menu: updatedDailyMenu });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        res.json({ message: 'Weekly menu updated successfully', menu: updatedWeeklyMenu });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        // Convert the image buffer uploaded via multer to base64 for Gemini
        const imageBase64 = req.file.buffer.toString("base64");

        const prompt = `
            Analyze this mess menu image. Extract the 7-day schedule (Monday to Sunday) for Breakfast, Lunch, and Dinner.
            Return ONLY a raw JSON object matching this exact structure. Do not wrap it in markdown code blocks like \`\`\`json.
            {
              "monday": {
                "breakfast": { "time": { "start": "07:30", "end": "09:30" }, "diet": [{ "name": "Item 1" }], "extras": [] },
                "lunch": { "time": { "start": "12:30", "end": "14:30" }, "diet": [{ "name": "Item 1" }], "extras": [] },
                "dinner": { "time": { "start": "19:30", "end": "21:30" }, "diet": [{ "name": "Item 1" }], "extras": [] }
              },
              "tuesday": { ... }
            }

            if no timinig is mentioned give default timings as breakfast: 07:30-09:30, lunch: 12:30-14:30, dinner: 19:30-21:30.
            if no price is mentioned for extras, set price to 0.
            if no diet item is mentioned for a meal, set it to an empty array.
            if no extras are mentioned for a meal, set it to an empty array.
            if items are optional ie this or that, include all items in the diet array. Do not skip any.
        `;

        const contents = [
            {
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
            },
            },
            { text: prompt }
        ]

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
        });

        // Clean the response text (sometimes Gemini adds markdown code blocks despite being told not to)
        let jsonString = response.text.trim();
        if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
        if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
        if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);

        const extractedMenu = JSON.parse(jsonString.trim());
        
        res.json(extractedMenu);
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ message: "Failed to parse image.", error: error.message });
    }
};

module.exports = {
    fetchTodayMenu,
    fetchWeeklyMenu,
    updateTodayMenu,
    uploadWeeklyMenu,
    extractWeeklyMenuFromImage
};