const express = require('express');
const router = express.Router();
const { protect,checkUserExists,validateSignupData } = require('../middlewares/authMiddleware'); 

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
} = require('../controllers/authController');

if (!validateSignupData) console.error("❌ ERROR: validateSignupData is undefined!");
if (!signup) console.error("❌ ERROR: signup controller function is undefined!");
if (!checkUserExists) console.error("❌ ERROR: checkUserExists is undefined!");
if (!login) console.error("❌ ERROR: login controller function is undefined!");

// Standard Auth
router.post('/login', checkUserExists, login);
router.post('/signup', validateSignupData, signup);

// OTP Verification & Resend
router.post('/verify-email', checkUserExists, verifyEmail);
router.post('/resend-otp', checkUserExists, resendOtp);

// OTP Login Flow
router.post('/send-login-otp', checkUserExists, sendLoginOTP);
router.post('/login-with-otp', checkUserExists, loginWithOTP);

// Forgot Password Flow
router.post('/forgot-password/send-otp', checkUserExists, sendForgotPasswordOtp);
router.post('/forgot-password/verify-otp', checkUserExists, verifyForgotPasswordOtp);
router.post('/forgot-password/reset', checkUserExists, resetPassword);

// Change Password (Requires user to be logged in)
router.post('/change-password', protect, changePassword);

// Logout
router.post('/logout', logout);

// Get Current User Info
router.get('/me', protect, getMe);

module.exports = router;