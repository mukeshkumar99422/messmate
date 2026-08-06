import { z } from "zod";
import { dateStringField, mealField, itemIdField, hostelIdField, strongPasswordField, passwordField, suggestionField } from "./common";

//purchase extra
const purchaseItemSchema = z.object({
    itemId: itemIdField("itemId"),
    qty: z.coerce
        .number({ error: 'qty is required' })
        .int('qty must be a whole number')
        .min(1, 'qty must be between 1-100')
        .max(100, 'qty must be between 1-100'),
});

export const addExtraPurchaseSchema = z.object({
    date: dateStringField,
    meal: mealField,
    items: z
        .array(purchaseItemSchema, { error: 'Items must be a non-empty array' })
        .min(1, 'Items must be a non-empty array')
        .max(50, 'Max 50 items per transaction'),
});

//rating
const SUGGESTION_REGEX = /^[a-zA-Z0-9\s.,!?()'\-:;]*$/;
export const addRatingSchema = z.object({
    itemId: itemIdField("itemId"),
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

//change password
export const changePasswordSchema = z
    .object({
        oldPassword: passwordField,
        newPassword: strongPasswordField,
    })
    .refine(data => data.oldPassword !== data.newPassword, {
        error: 'New password must be different from old password',
        path: ['newPassword'],
    });

//change hostel
export const changeHostelSchema = z.object({
    newHostelId: hostelIdField
});