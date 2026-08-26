const express = require('express');
const router = express.Router();
const { protect, checkUserExists } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const {credentialGuessLimiter,emailSendLimiter} = require('../middlewares/rateLimiter');

//csrf security needed on routes:-
//1. no protect middleware, ie no authorization header
//2. database manipulation is there(post,put,delete,patch etc.)
// const { doubleCsrfProtection } = require('../middlewares/csrfMiddleware');

const {
    loginSchema,
    signupSchema,
    verifyEmailSchema,
    loginWithOtpSchema,
    verifyForgotPasswordOtpSchema,
    resetPasswordSchema,
    changePasswordSchema,
} = require('../dtos/auth/request.zod');

const {
    login,
    signup,
    verifyEmail,
    resendOtp,
    sendLoginOTP,
    loginWithOTP,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPassword,
    changePassword,
    logout,
    getMe,
    handleRefreshToken,
} = require('../controllers/authController');

//signup (public)
router.post('/signup', credentialGuessLimiter, validate(signupSchema), signup);

// Standard login
router.post('/login', credentialGuessLimiter, checkUserExists, validate(loginSchema), login);

// OTP Verification & Resend
router.post('/verify-email', credentialGuessLimiter, checkUserExists, validate(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', checkUserExists, emailSendLimiter, resendOtp);

// OTP Login Flow
router.post('/send-login-otp', checkUserExists, emailSendLimiter, sendLoginOTP);
router.post('/login-with-otp', credentialGuessLimiter, checkUserExists, validate(loginWithOtpSchema), loginWithOTP);

// Forgot Password Flow
router.post('/forgot-password/send-otp', checkUserExists, emailSendLimiter, sendForgotPasswordOtp);
router.post('/forgot-password/verify-otp', credentialGuessLimiter, checkUserExists, validate(verifyForgotPasswordOtpSchema), verifyForgotPasswordOtp);
router.post('/forgot-password/reset', credentialGuessLimiter, checkUserExists, validate(resetPasswordSchema), resetPassword);

// revoke access
router.post('/refresh', handleRefreshToken);


// -------------for authenticated users(having access token)--------------------
// Change Password (Requires user to be logged in)
router.post('/change-password', protect, credentialGuessLimiter, validate(changePasswordSchema), changePassword);

// Get Current User Info
router.get('/me',protect, getMe);

// Logout
router.post('/logout', protect, logout);

module.exports = router;