import { z } from "zod";
import { DAYS, MEALS } from "../assets/assets";
import {
  dateStringField,
  mealField,
  itemIdField,
  itemNameField,
  priceField,
  timeStringField,
} from "./common";

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

//---------------------
const dietSchema = z
    .array(dietItemSchema, { error: "Diet list is required" })
    .min(1, "At least one diet item is required")
    .max(30, "Too many diet items");

const extraSchema = z
  .array(extraItemSchema)
  .max(30, "Too many extra items")
  .optional()
  .default([]);

//-----------------Update Today's Menu----------------
export const updateTodayMenuSchema = z.object({
  date: dateStringField,
  meal: mealField,
  time: timeSchema,
  diet: dietSchema,
  extras: extraSchema,
});

// -------- Update Full Weekly Menu --------
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
export const weeklyMenuSchema = z.object(
    Object.fromEntries(DAYS.map(day => [day, dayPayloadField]))
);

// -------- Quick Update Item Price --------
export const updateItemPriceSchema = z.object({
  itemId: itemIdField("itemId"),
  newPrice: priceField,
});