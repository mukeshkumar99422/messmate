const express = require('express');
const router = express.Router();
const { protect,checkUserExists } = require('../middlewares/authMiddleware'); 

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
    getMe
} = require('../controllers/authController');

// Standard Auth
router.post('/login', checkUserExists, login);
router.post('/signup', signup);

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