const { z } = require('zod');
const { hostelIdField, dateStringField, mealField, itemIdField, dayField, suggestionField } = require('../common/fields.zod');

// ---------------------------------------------
// PUT /change-hostel
// ---------------------------------------------
const changeHostelSchema = z.object({
    newHostelId: hostelIdField,
});

// ---------------------------------------------
// GET /menu/day/:day
// ---------------------------------------------
const dayParamSchema = z.object({
    day: dayField
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
    itemId: itemIdField('itemId'),
    qty: z.coerce
        .number({ error: 'qty is required' })
        .int('qty must be a whole number')
        .min(1, 'qty must be between 1-100')
        .max(100, 'qty must be between 1-100'),
});

const addExtraPurchaseSchema = z.object({
    date: dateStringField,
    meal: mealField,
    items: z
        .array(purchaseItemSchema, { error: 'Items must be a non-empty array' })
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
        .enum(['daily', 'weekly', 'monthly'], { error: 'groupBy must be daily/weekly/monthly' })
        .optional()
        .default('daily'),
});

// ---------------------------------------------
// POST /rate
// ---------------------------------------------
const addRatingSchema = z.object({
    itemId: itemIdField('itemId'),
    meal: mealField,
    rating: z.coerce
        .number({ error: 'Rating is required' })
        .int('Rating must be 1-5')
        .min(1, 'Rating must be 1-5')
        .max(5, 'Rating must be 1-5'),
    tags: z
        .array(z.string().trim().min(1).max(30, 'Each tag must be at most 30 characters'))
        .max(10, 'Max 10 tags')
        .optional()
        .default([]),
    suggestion: suggestionField,
});

module.exports = {
    changeHostelSchema,
    dayParamSchema,
    extrasQuerySchema,
    addExtraPurchaseSchema,
    analyseExtraQuerySchema,
    addRatingSchema,
};