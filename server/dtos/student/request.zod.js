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
    .pipe(z.enum(MEALS, { errorMap: () => ({ message: 'Meal must be: breakfast/lunch/dinner' }) }));

const objectIdField = (label = 'id') =>
    z.string({ required_error: `${label} is required` })
        .refine(val => mongoose.Types.ObjectId.isValid(val), { message: `Invalid ${label}` });

// ---------------------------------------------
// PUT /change-hostel
// ---------------------------------------------
const changeHostelSchema = z.object({
    newHostelId: z.coerce
        .number({ invalid_type_error: 'Hostel is a number, indicating hostel number', required_error: 'newHostelId is required' })
        .int('Invalid hostel id'),
});

// ---------------------------------------------
// GET /menu/day/:day
// ---------------------------------------------
const dayParamSchema = z.object({
    day: z
        .string({ required_error: 'Day is required' })
        .trim()
        .toLowerCase()
        .pipe(z.enum(DAYS, { errorMap: () => ({ message: 'Day must be a valid weekday name' }) })),
});

// ---------------------------------------------
// GET /extras?date=&meal=
// ---------------------------------------------
const extrasQuerySchema = z.object({
    date: dateStringField,
    meal: mealField,
});

// ---------------------------------------------
// POST /purchase
// ---------------------------------------------
const purchaseItemSchema = z.object({
    itemId: objectIdField('itemId'),
    qty: z.coerce
        .number({ invalid_type_error: 'qty is required', required_error: 'qty is required' })
        .int('qty must be a whole number')
        .min(1, 'qty must be between 1-100')
        .max(100, 'qty must be between 1-100'),
});

const addExtraPurchaseSchema = z.object({
    date: dateStringField,
    meal: mealField,
    items: z
        .array(purchaseItemSchema, { required_error: 'Items must be a non-empty array' })
        .min(1, 'Items must be a non-empty array')
        .max(50, 'Max 50 items per transaction'),
});

// ---------------------------------------------
// GET /analyse-purchases?from=&to=&groupBy=
// ---------------------------------------------
const analyseExtraQuerySchema = z.object({
    from: dateStringField.optional().or(z.literal('')),
    to: dateStringField.optional().or(z.literal('')),
    groupBy: z
        .enum(['daily', 'weekly', 'monthly'], { errorMap: () => ({ message: 'groupBy must be daily/weekly/monthly' }) })
        .optional()
        .default('daily'),
});

// ---------------------------------------------
// POST /rate
// ---------------------------------------------
const addRatingSchema = z.object({
    itemId: objectIdField('itemId'),
    meal: mealField,
    rating: z.coerce
        .number({ invalid_type_error: 'Rating is required', required_error: 'Rating is required' })
        .int('Rating must be 1-5')
        .min(1, 'Rating must be 1-5')
        .max(5, 'Rating must be 1-5'),
    tags: z
        .array(z.string().trim().min(1).max(30, 'Each tag must be at most 30 characters'))
        .max(10, 'Max 10 tags')
        .optional()
        .default([]),
    suggestion: z
        .string()
        .trim()
        .max(500, 'Max 500 characters long suggestion.')
        .optional()
        .nullable()
        .transform(val => val || null),
});

module.exports = {
    changeHostelSchema,
    dayParamSchema,
    extrasQuerySchema,
    addExtraPurchaseSchema,
    analyseExtraQuerySchema,
    addRatingSchema,
};