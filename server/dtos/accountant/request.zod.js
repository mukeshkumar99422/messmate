const { z } = require('zod');
const mongoose = require('mongoose');
const { validateDate } = require('../../utils/helpers');

// ---------------------------------------------
// Shared primitives
// ---------------------------------------------

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

const dateStringField = z
    .string({ required_error: 'Date is required' })
    .trim()
    .refine(validateDate, { message: 'Invalid date format, expected YYYY-MM-DD' });

const mealField = z
    .string({ required_error: 'Meal is required' })
    .trim()
    .toLowerCase()
    .pipe(z.enum(MEALS, { errorMap: () => ({ message: 'Meal must be breakfast, lunch, or dinner' }) }));

const objectIdField = (label = 'id') =>
    z.string({ required_error: `${label} is required` })
        .refine(val => mongoose.Types.ObjectId.isValid(val), { message: `Invalid ${label}` });

const timeField = z.object({
    start: z.string({ required_error: 'Start time is required' }).trim().min(1, 'Start time is required'),
    end: z.string({ required_error: 'End time is required' }).trim().min(1, 'End time is required'),
});

const dietItemField = z.object({
    name: z.string({ required_error: 'Diet item name is required' }).trim().min(1, 'Diet item name cannot be empty').max(100, 'Diet item name too long'),
});

const extraItemField = z.object({
    name: z.string({ required_error: 'Extra item name is required' }).trim().min(1, 'Extra item name cannot be empty').max(100, 'Extra item name too long'),
    price: z.coerce.number({ invalid_type_error: 'Price is required', required_error: 'Price is required' }).min(1, 'Price must be at least 1'),
});


// ---------------------------------------------
// PUT /menu/today
// ---------------------------------------------
const updateTodayMenuSchema = z.object({
    date: dateStringField,
    meal: mealField,
    
    time: timeField,
    diet: z.array(dietItemField, { required_error: 'Diet must be an array' }),
    extras: z.array(extraItemField, { required_error: 'Extras must be an array' }),
});

// ---------------------------------------------
// POST /menu/weekly
// ---------------------------------------------
// A single meal's payload: { time, diet: [], extras: [] }
const mealPayloadField = z.object({
    time: timeField,
    diet: z.array(dietItemField, { required_error: 'Diet must be an array' }),
    extras: z.array(extraItemField, { required_error: 'Extras must be an array' }),
});

// single day payload: over breakfast,lunch,dinner
const dayPayloadField = z.object({
    breakfast: mealPayloadField,
    lunch: mealPayloadField,
    dinner: mealPayloadField,
});

// full menu payload: over all 7 days
const uploadWeeklyMenuSchema = z.object(
    Object.fromEntries(DAYS.map(day => [day, dayPayloadField]))
);

// ---------------------------------------------
// PATCH /item/price
// ---------------------------------------------
const updateItemPriceSchema = z.object({
    itemId: objectIdField('itemId'),
    newPrice: z.coerce
        .number({ invalid_type_error: 'newPrice is required', required_error: 'newPrice is required' })
        .min(1, 'Price must be at least 1'),
});

// ---------------------------------------------
// GET /reviews/analyse?fresh=true
// ---------------------------------------------
const reviewAnalysisQuerySchema = z.object({
    fresh: z
        .enum(['true', 'false'], { errorMap: () => ({ message: 'fresh must be true or false' }) })
        .optional()
        .default('false')
        .transform(val => val === 'true'),
});

module.exports = {
    updateTodayMenuSchema,
    uploadWeeklyMenuSchema,
    updateItemPriceSchema,
    reviewAnalysisQuerySchema,
};