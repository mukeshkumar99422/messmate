const {validateDate} = require('../utils/helpers');


// ============================================================
// VALIDATION FOR EXTRA PURCHASES
// ============================================================
const validateExtraPurchase = (req, res, next) => {
    const {date, meal, items, totalAmount} = req.body;

    // 1. existance check
    if (!date || !meal || !items || !totalAmount) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const cDate = String(date).trim();
    const cMeal = String(meal).trim().toLowerCase();
    const cTotalAmount = Number(totalAmount);

    // 2. date validation
    if (!validateDate(cDate)) {
        return res.status(400).json({ message: "Invalid date format YYYY-MM-DD" });
    }
    // 3. meal validation
    const validMeals = ['breakfast', 'lunch', 'dinner'];
    if (!validMeals.includes(cMeal)) {
        return res.status(400).json({ message: "Invalid meal type" });
    }

    // 4. items array validation
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items must be non-empty array" });
    }

    if (items.length > 50) { // Denial-of-Service array overflow protection
        return res.status(400).json({ message: "Max 50 items per transaction" });
    }

    let calculatedTotal = 0;
    const sanitizedItems = [];

    // 5. Deep Scan & Clean Loop over individual item objects
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // validate type of each item
        if (item == null || typeof item !== 'object') {
            return res.status(400).json({ message: `Item ${i}: invalid object` });
        }

        const { name, price, qty } = item;

        // Field presence check
        if (!name || !price || !qty) {
            return res.status(400).json({ message: `Item ${i}: missing fields` });
        }

        // NOTE:-
        // in production these types of filds are not actually validated
        // frontend sends id or item and backend search item directly via these ids
        // BCS one may send request via postman like plateform with tampered data
        const cleanName = String(name).trim();
        const numericPrice = Number(price);
        if (cleanName.length < 2 || cleanName.length > 100) {
            return res.status(400).json({ message: `Item ${i}: name 2-100 chars` });
        }
        if (isNaN(numericPrice) || numericPrice < 0 || numericPrice > 10000) {
            return res.status(400).json({ message: `Item ${i}: price 0-10000` });
        }
        

        // Validate Item Quantity
        const numericQty = Number(qty);
        if (!Number.isInteger(numericQty) || numericQty <= 0 || numericQty > 100) {
            return res.status(400).json({ message: `Item ${i}: qty 1-100` });
        }

        // Accumulate mathematical transaction total
        calculatedTotal += numericPrice * numericQty;

        // Push explicitly cleaned fields to strip out any unwanted malicious object properties
        sanitizedItems.push({
            name: cleanName,
            price: numericPrice,
            qty: numericQty
        });
    }

    // 6. Verify Total Matching
    const clientTotal = Number(totalAmount);
    if (Math.abs(calculatedTotal - clientTotal) > 0.01) {
        return res.status(400).json({ message: "Transaction total balance mismatch." });
    }
    

    // 7. Re-assign sanitized values straight back to the request body object frame
    req.body.date = date;
    req.body.meal = meal;
    req.body.items = sanitizedItems;
    req.body.totalAmount = Number(clientTotal.toFixed(2));

    next();
};

// ============================================================
// VALIDATION FOR RATINGS
// ============================================================
const validateRatingSubmission = (req, res, next) => {
    const { itemName, itemType, meal, rating, tags, suggestion } = req.body;

    // 1. Mandatory Fields Presence Check
    if (!itemName || !itemType || !meal || !rating ) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // 2. Validate & Sanitize Item Name
    const cleanItemName = String(itemName).trim();
    if (cleanItemName.length < 2 || cleanItemName.length > 100) {
        return res.status(400).json({ message: "Name must be 2-100 chars" });
    }

    // 3. Validate Item Type Enum ('diet' or 'extra')
    const cleanItemType = itemType.trim().toLowerCase();
    if (!['diet', 'extra'].includes(cleanItemType)) {
        return res.status(400).json({ message: "ItemType must be: diet or extra" });
    }

    // 4. Validate Meal Enum ('breakfast', 'lunch', 'dinner')
    const cleanMeal = meal.trim().toLowerCase();
    if (!['breakfast', 'lunch', 'dinner'].includes(cleanMeal)) {
        return res.status(400).json({ message: "Meal must be: breakfast/lunch/dinner" });
    }

    // 5. Strict Bound Checks on Rating (Must be integer 1 to 5)
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ message: "Rating must be 1-5" });
    }

    // 6. Validate & Sanitize Tags Array (Optional)
    let sanitizedTags = [];
    if (tags !== undefined) {
        if (!Array.isArray(tags)) {
            return res.status(400).json({ message: "Tags must be array" });
        }
        if (tags.length > 10) {
            return res.status(400).json({ message: "Max 10 tags" });
        }
        // Trim and filter out any empty entries or non-string inputs
        sanitizedTags = tags
            .map(tag => String(tag).trim())
            .filter(tag => tag.length > 0 && tag.length <= 30);
    }

    // 7. Validate & Sanitize Suggestion Text (Optional)
    let cleanSuggestion = "";
    if (suggestion !== undefined && suggestion !== null) {
        cleanSuggestion = String(suggestion).trim();
        if (cleanSuggestion.length > 500) { // Bound upper length against text flood
            return res.status(400).json({ message: "Max 500 characters long suggestion." });
        }
    }

    // 8. Re-assign sanitized values back onto the request object frame
    req.body.itemName = cleanItemName;
    req.body.itemType = cleanItemType;
    req.body.meal = cleanMeal;
    req.body.rating = numericRating;
    req.body.tags = sanitizedTags;
    req.body.suggestion = cleanSuggestion || null;

    next();
};


module.exports = {
    validateExtraPurchase,
    validateRatingSubmission,
};

