const { z } = require('zod');
const { validateNITKKREmail, validatePasswordStrength, validateOtp } = require('../../utils/helpers');

// ---------------------------------------------
// Shared primitives
// ---------------------------------------------

const nitkkrEmailField = z
    .string({ required_error: 'Identifier is required' })
    .trim()
    .toLowerCase()
    .refine(validateNITKKREmail, { message: 'Please provide a valid email id' });

const strongPasswordField = z
    .string({ required_error: 'Password is required' })
    .refine(validatePasswordStrength, {
        message: 'Password must be 6-72 characters and include an uppercase letter, a lowercase letter, a number, and a special character.',
    });

const otpField = z
    .string({ required_error: 'OTP is required' })
    .trim()
    .refine(validateOtp, {message: 'OTP must be 6 digits long'});


// ---------------------------------------------
// POST /login
// ---------------------------------------------
const loginSchema = z.object({
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

// ---------------------------------------------
// POST /signup
// ---------------------------------------------
const signupSchema = z.object({
    name: z.string({ required_error: 'Name is required' }).trim().min(1, 'Name is required'),
    identifier: nitkkrEmailField,
    //Number(val) reuturn NaN if any err, while z.coerce.number(val) returns structured error
    hostel: z.coerce
        .number({ invalid_type_error: 'Hostel is a number, indicating hostel number', required_error: 'Hostel is required' })
        .int('Invalid hostel id'),
    password: strongPasswordField,
});

// ---------------------------------------------
// POST /verify-email
// ---------------------------------------------
const verifyEmailSchema = z.object({
    otp: otpField,
});

// ---------------------------------------------
// POST /login-with-otp
// ---------------------------------------------
const loginWithOtpSchema = z.object({
    otp: otpField,
});

// ---------------------------------------------
// POST /forgot-password/verify-otp
// ---------------------------------------------
const verifyForgotPasswordOtpSchema = z.object({
    otp: otpField,
});

// ---------------------------------------------
// POST /forgot-password/reset
// ---------------------------------------------
const resetPasswordSchema = z.object({
    otp: otpField,
    newPassword: strongPasswordField,
});

// ---------------------------------------------
// POST /change-password
// ---------------------------------------------
const changePasswordSchema = z
    .object({
        oldPassword: z.string({ required_error: 'Old password is required' }).min(1, 'Old password is required'),
        newPassword: strongPasswordField,
    })
    .refine(data => data.oldPassword !== data.newPassword, {
        message: 'Use a different new password',
        path: ['newPassword'],
    });

module.exports = {
    loginSchema,
    signupSchema,
    verifyEmailSchema,
    loginWithOtpSchema,
    verifyForgotPasswordOtpSchema,
    resetPasswordSchema,
    changePasswordSchema,
};