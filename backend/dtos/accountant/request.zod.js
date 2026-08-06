const {dateStringField, DAYS, itemIdField, itemNameField, mealField, priceField, timeStringField} = require('../common/fields.zod');
const { z } = require('zod');

// ------------------Shared primitives---------------
const timeSchema = z
  .object({ start: timeStringField, end: timeStringField })
  .refine((t) => t.start !== t.end, { error: "Start and end time cannot be the same", path: ["end"] })
  .refine((t) => t.start < t.end, { error: "End time must be after start time", path: ["end"] });

//-----------------------------
const dietItemSchema = z.object({
  _id: z.string().optional(),
  name: itemNameField,
});

const extraItemSchema = z.object({
  _id: z.string().optional(),
  name: itemNameField,
  price: priceField,
});

//-------------------
const dietSchema = z
    .array(dietItemSchema, { error: "Diet list is required" })
    .min(1, "At least one diet item is required")
    .max(30, "Too many diet items");

const extraSchema = z
  .array(extraItemSchema)
  .max(30, "Too many extra items")
  .optional()
  .default([])

// ---------------------------------------------
// PUT /menu/today
// ---------------------------------------------
const updateTodayMenuSchema = z.object({
  date: dateStringField,
  meal: mealField,
  time: timeSchema,
  diet: dietSchema,
  extras: extraSchema,
});

// ---------------------------------------------
// POST /menu/weekly
// ---------------------------------------------
// A single meal's payload: { time, diet: [], extras: [] }
const mealDataSchema = z.object({
  time: timeSchema,
  diet: dietSchema,
  extras: extraSchema,
});

// single day payload: over breakfast,lunch,dinner
const dayPayloadField = z.object({
    breakfast: mealDataSchema,
    lunch: mealDataSchema,
    dinner: mealDataSchema,
});

// full menu payload: over all 7 days
const uploadWeeklyMenuSchema = z.object(
    Object.fromEntries(DAYS.map(day => [day, dayPayloadField]))
);

// ---------------------------------------------
// PATCH /item/price
// ---------------------------------------------
const updateItemPriceSchema = z.object({
    itemId: itemIdField("itemId"),
    newPrice: priceField,
});

// ---------------------------------------------
// GET /reviews/analyse?fresh=true
// ---------------------------------------------
const reviewAnalysisQuerySchema = z.object({
    fresh: z
        .enum(['true', 'false'], { error: 'fresh must be true or false' })
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