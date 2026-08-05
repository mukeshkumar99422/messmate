import { validateDate } from "../utils/authHelpers";
import { MEALS, RESIDENTS } from "../assets/assets";

import { z } from "zod";
import {
  validateNITKKREmail,
  validateNormalEmail,
  validateContactNumber,
  validatePassword,
  validateOtp,
} from "../utils/authHelpers";

const NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9 .'&-]*$/;
const SUGGESTION_REGEX = /^[a-zA-Z0-9\s.,!?()'\-:;]*$/;

//----------------------
export const nitkkrEmailField = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .refine(validateNITKKREmail, { error: "Please use your official @nitkkr.ac.in email" });

export const studentIdentifierField = z
  .string({ error: 'Identifier is required' })
  .trim()
  .toLowerCase()
  .refine(validateNITKKREmail, { error: 'Identifiers must be valid student\'s email' });

export const normalEmailField = (label = "Email") =>
  z.string({ error: `${label} is required` })
    .trim()
    .toLowerCase()
    .refine(validateNormalEmail, { error: `Invalid ${label.toLowerCase()} format` });

export const identifierField = z
  .string({ error: "Email or ID is required" })
  .trim().min(1, "Email or ID is required")
  .max(256, "Provide a valid Email or ID");

export const loginIdField = z
  .string({ error: "Login ID is required" })
  .trim()
  .min(3, "Login ID is too short")
  .max(50, "Login ID is too long");

//------------------
export const contactNumberField = (label = "Contact number") =>
  z.string().trim().refine((v) => v === "" || validateContactNumber(v), {
    error: `Invalid ${label.toLowerCase()} format`,
  });


//---------------------
export const passwordField = z
  .string({ error: "Password is required" })
  .min(1, "Password is required");

export const strongPasswordField = z
  .string({ error: "Password is required" })
  .refine(validatePassword, {
    error: "Password must be 6–72 characters and include uppercase, lowercase, number, and special character.",
  });

//------------------------
export const otpField = z
  .string({ error: "OTP is required" })
  .trim()
  .refine(validateOtp, { error: "OTP must be 6 digits" });

//----------------------
export const studentNameField = z
  .string({ error: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(100, "Too long name")
  .refine((n) => NAME_REGEX.test(n), {
    error: "Name contains invalid characters",
  });

//-------------------------
export const dateStringField = z
  .string({ error: 'Date is required' })
  .trim()
  .refine(validateDate, { error: 'Invalid date format, expected YYYY-MM-DD' });

export const timeStringField = z
  .string({ error: "Time is required" })
  .trim()
  .refine((v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v), {
    error: "Time must be in HH:MM (24hr) format",
  });

//----------------------------
export const itemIdField = (label = 'id') =>
  z.string({ error: `${label} is required` })
    .trim()
    .regex(/^[a-f\d]{24}$/i, { error: `Invalid ${label}` });

export const itemNameField = z
  .string({ error: "Item name is required" })
  .trim()
  .min(1, "Item name is required")
  .max(50, "Item name is too long")
  .refine((n) => NAME_REGEX.test(n), {
    error: "Item name contains invalid characters",
  });

export const priceField = z.coerce
  .number({ error: "Price is required" })
  .min(1, "Price must be at least 1")
  .max(1000, "Price seems too high, please check");

//-----------------------
export const mealField = z
  .string({ error: 'Meal is required' })
  .trim()
  .toLowerCase()
  .pipe(z.enum(MEALS, { error: 'Meal must be: breakfast/lunch/dinner' }));

//-------------------------------
export const hostelIdField = z.coerce
  .number({
    error: (issue) => issue.input === undefined ? 'Hostel id is required' : 'Hostel is a number, indicating hostel number',
  })
  .int('Invalid hostel id')
  .min(1,'Invalid hostel id');

export const hostelNameField = z
  .string({ error: 'Hostel name is required' })
  .trim()
  .min(3, 'Hostel name: 3-100 characters')
  .max(100, 'Hostel name: 3-100 characters')
  .refine((n) => NAME_REGEX.test(n), {
    error: "Hostel name contains invalid characters",
  });

export const residentsField = z
  .string({ error: 'Residents type is required' })
  .trim()
  .toLowerCase()
  .pipe(z.enum(RESIDENTS, { error: "Only 'boys' or 'girls' allowed." }));

//---------------------------------------
export const suggestionField = z
  .string()
  .trim()
  .max(100, 'Max 100 characters long suggestion.')
  .regex(SUGGESTION_REGEX, { error: 'Suggestion contains invalid characters.' })
  .optional()
  .nullable()
  .transform(val => val || null);