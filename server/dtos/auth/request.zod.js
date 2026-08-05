const { z } = require('zod');
const { passwordField, nitkkrEmailField, strongPasswordField, hostelIdField, otpField, studentNameField } = require('../common/fields.zod');

// ---------------------------------------------
// POST /login
// ---------------------------------------------
const loginSchema = z.object({
    password: passwordField,
});

// ---------------------------------------------
// POST /signup
// ---------------------------------------------
const signupSchema = z.object({
    name: studentNameField,
    identifier: nitkkrEmailField,
    //Number(val) reuturn NaN if any err, while z.coerce.number(val) returns structured error
    hostel: hostelIdField,
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
        oldPassword: z.string({ error: 'Old password is required' }).min(1, 'Old password is required'),
        newPassword: strongPasswordField,
    })
    .refine(data => data.oldPassword !== data.newPassword, {
        error: 'New password must be different from old password',
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