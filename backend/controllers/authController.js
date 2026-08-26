const Hostel = require('../models/Hostel');
const User = require('../models/User');
const Otp = require('../models/Otp');

const generateAndSendOTP = require('../utils/generateAndSendOTP');
const queueEmail = require('../utils/email/queueEmail');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getSessionUser, touchSession, revokeSession, revokeAllSessions, pruneExpiredSessions } = require('../utils/token/redisRefreshToken');
const { generateTokens, reissueAccessToken, rotateRefreshToken } = require('../utils/token/generateToken');
const { getISTDateString, verifyOtpSafely, escapeHtml } = require('../utils/helpers');

const { LoginResponseDTO, GetMeResponseDTO } = require('../dtos/auth/response.dto');

const AppError = require('../utils/appError');

// ==========================================
// 1. STANDARD LOGIN (Password) - All Roles
// ==========================================
const login = async (req, res, next) => {
    const { password } = req.body;

    try {
        const user = req.existingUser;

        if (!(await bcrypt.compare(password, user.password))) {
            return next(new AppError('Invalid credentials', 401));
        }

        if (!user.isVerified) {
            return next(
                new AppError( 'Please verify your email', 403, 'EMAIL_UNVERIFIED', { email: user.email, } )
            );
        }
        
        await user.populate('hostel', 'name id');

        const accessToken = await generateTokens(res, user._id, user.role);
        res.json(LoginResponseDTO(user, accessToken));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2. SIGNUP - Students Only
// ==========================================
const signup = async (req, res, next) => {
    const { name, identifier, hostel, password } = req.body;

    try {
        const userExists = await User.findOne({
            $or: [
                { email: identifier },
                { identifier: identifier }
            ]
        });
        if (userExists) {
            return next(new AppError('User with this email already exists', 400));
        }

        const hostelExists = await Hostel.findOne({ id: hostel });
        if (!hostelExists) {
            return next(new AppError('Specified hostel does not exist', 400));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name,
            identifier,
            email: identifier,
            password: hashedPassword,
            role: 'student',
            hostel: hostelExists._id,
        });

        try {
            await generateAndSendOTP(
                identifier,
                'Your Mess Mate Verification Code',
                `<p>Hello,</p>
                <p><strong>Your verification OTP is: {{OTP}}</strong></p>
                <p>This code is valid for the next 5 minutes. If you did not request this, please ignore this email.</p>
                <p>Best regards,<br/>The Mess Mate Team<br/>National Institute of Technology, Kurukshetra</p>`
            );
        } catch (error) {
            console.error("Failed to send verification OTP:", error);
        }

        res.status(201).json({ message: 'Signup successful, Please verify email' });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3. VERIFY EMAIL OTP (After Signup)
// ==========================================
const verifyEmail = async (req, res, next) => {
    const { otp } = req.body;
    const cemail = req.existingUser.email;

    try {
        const result = await verifyOtpSafely(cemail, otp);
        if (!result.valid) {
            return next(new AppError(
                result.reason === 'too_many_attempts'
                    ? 'Too many attempts. Please request a new OTP.'
                    : 'Invalid or expired OTP',
                400
            ));
        }

        if (req.existingUser.isVerified) {
            return next(
                new AppError( 'Email is already verified.', 409, 'EMAIL_ALREADY_VERIFIED' )
            );
        }

        req.existingUser.isVerified = true;
        await req.existingUser.save();

        await Hostel.findByIdAndUpdate(req.existingUser.hostel, { $inc: { studentCount: 1 } });

        await Otp.deleteMany({ email: cemail });

        try {
            const welcomeSubject = `[MessMate] Welcome to Your Campus Dining Portal!`;
            const siteUrl = process.env.CLIENT_URL;
            const welcomeMessage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to MessMate</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-w: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <tr>
            <td style="background-color: #16a34a; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Mess<span style="color: #d1fae5;">Mate</span></h1>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5; font-weight: 500;">Your Smart Campus Dining Companion</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #1e293b;">Hello <strong>${escapeHtml(req.existingUser.name)}</strong>,</p>
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
                    Your MessMate student account has been successfully verified and activated! Welcome to a streamlined, modern campus dining experience.
                </p>
                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569;">
                    You can now access your digital dashboard to view live menus, log optional add-on purchases seamlessly, track your dining expenses with interactive analytics charts, and submit food quality ratings directly to the mess committee.
                </p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0; text-align: center;">
                    <tr>
                        <td>
                            <a href="${siteUrl}" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.2); transition: background-color 0.2s;">
                                Access Your MessMate Account
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-top: 12px; font-size: 11px; color: #94a3b8; font-family: Menlo, Monaco, monospace;">
                            ${siteUrl}
                        </td>
                    </tr>
                </table>
                <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 20px; color: #64748b;">
                    💡 Quick Tip: Keep an eye on your live profile card to monitor your active hostel allocation metrics and daily dynamic menu overrides.
                </p>
                <p style="margin: 32px 0 0 0; font-size: 14px; color: #475569; line-height: 20px;">
                    Best regards,<br>
                    <strong style="color: #0f172a;">Mess Mate Team</strong><br>
                    <span style="font-size: 12px; color: #64748b;">National Institute of Technology, Kurukshetra</span>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; line-height: 16px;">
                You are receiving this transactional email because you registered an account under your official university domain identifier.
                <br><br>
                © ${new Date(getISTDateString()).getFullYear()} MessMate System. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>
`;

            await queueEmail({
                email: cemail,
                subject: welcomeSubject,
                message: welcomeMessage,
                dedupeKey: `welcome-email-${cemail}`
            });
        } catch (error) {
            console.error("Failed to send creation email:", error);
        }

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4. RESEND OTP
// ==========================================
const resendOtp = async (req, res, next) => {
    const email = req.existingUser.email;
    try {
        await generateAndSendOTP(
            email,
            'Mess Mate - New OTP',
            `<p>Hello,</p>
            <p><strong>Your new verification code is: {{OTP}}</strong></p>
            <p>This code is valid for the next 5 minutes. If you did not request this, please ignore this email.</p>
            <p>Best regards,<br/>The Mess Mate Team<br/>National Institute of Technology, Kurukshetra</p>`
        );
        res.json({ message: 'OTP resent successfully' });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5. SEND LOGIN OTP (OTP Login Flow)
// ==========================================
const sendLoginOTP = async (req, res, next) => {
    const email = req.existingUser.email;

    try {
        await generateAndSendOTP(
            email,
            'Mess Mate - Login OTP',
            `<p>Hello,</p>
            <p>You requested a secure login code for your Mess Mate account.</p>
            <p><strong>Your login OTP is: {{OTP}}.</strong></p>
            <p>This code is valid for the next 5 minutes. If you did not request this, please ignore this email.</p>
            <p>Best regards,<br/>The Mess Mate Team<br/>National Institute of Technology, Kurukshetra</p>`
        );
        res.json({ message: 'Login OTP sent' });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6. LOGIN WITH OTP
// ==========================================
const loginWithOTP = async (req, res, next) => {
    const { otp } = req.body;
    const email = req.existingUser.email;

    try {
        const result = await verifyOtpSafely(email, otp);
        if (!result.valid) {
            return next(new AppError(
                result.reason === 'too_many_attempts'
                    ? 'Too many attempts. Please request a new OTP.'
                    : 'Invalid or expired OTP',
                400
            ));
        }

        const user = req.existingUser;
        await user.populate('hostel', 'name id');

        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();

            const hostel = await Hostel.findById(user.hostel);
            if (hostel) {
                hostel.studentCount = (hostel.studentCount || 0) + 1;
                await hostel.save();
            }
        }

        await Otp.deleteMany({ email: email });

        const accessToken = await generateTokens(res, user._id, user.role);
        res.json(LoginResponseDTO(user, accessToken));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 7. FORGOT PASSWORD FLOW
// ==========================================
const sendForgotPasswordOtp = async (req, res, next) => {
    const email = req.existingUser.email;

    try {
        await generateAndSendOTP(
            email,
            'Mess Mate - Reset Password OTP',
            `<p>Hello,</p>
            <p>You requested to reset your password for your Mess Mate account.</p>
            <p><strong>Your password reset OTP is: {{OTP}}</strong></p>
            <p>This code is valid for the next 5 minutes. If you did not request this, please ignore this email.</p>
            <p>Best regards,<br/>The Mess Mate Team<br/>National Institute of Technology, Kurukshetra</p>`
        );
        res.json({ message: 'Reset OTP sent' });
    } catch (error) {
        next(error);
    }
};

const verifyForgotPasswordOtp = async (req, res, next) => {
    const { otp } = req.body;
    const email = req.existingUser.email;

    try {
        const result = await verifyOtpSafely(email, otp);
        if (!result.valid) {
            return next(new AppError(
                result.reason === 'too_many_attempts'
                    ? 'Too many attempts. Please request a new OTP.'
                    : 'Invalid or expired OTP',
                400
            ));
        }

        res.json({ message: 'OTP verified, proceed to reset password' });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    const { otp, newPassword } = req.body;
    const email = req.existingUser.email;

    try {
        const result = await verifyOtpSafely(email, otp);
        if (!result.valid) {
            return next(new AppError(
                result.reason === 'too_many_attempts'
                    ? 'Too many attempts. Please request a new OTP.'
                    : 'Invalid or expired OTP',
                400
            ));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        req.existingUser.password = hashedPassword;
        await req.existingUser.save();

        await Otp.deleteMany({ email: email });
        await revokeAllSessions(req.existingUser._id.toString());

        try {
            await queueEmail({
                email: email,
                subject: 'Security Alert: Password Changed',
                message: `
                <p>Hello ${escapeHtml(req.existingUser.name || 'User')},</p>
                <p>Your MessMate password was just changed successfully on ${getISTDateString()}.</p>
                <p>If you did not authorize this change, please contact administration immediately.</p>
                <p>Best regards,<br/>The Mess Mate Team<br/>National Institute of Technology, Kurukshetra</p>`,
                dedupeKey: `password-reset-email-${email}-${Date.now()}`
            });
        } catch (error) {
            console.error("Failed to send password change email:", error);
        }

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 8. CHANGE PASSWORD (Logged In Users)
// ==========================================
const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    try {
        if (!(await bcrypt.compare(oldPassword, user.password))) {
            return next(new AppError('Incorrect old password', 400));
        }

        if (await bcrypt.compare(newPassword, user.password)) {
            return next(new AppError('Use a different new password', 400));
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        await revokeAllSessions(user._id.toString());
        const newAccessToken = await generateTokens(res, user._id, user.role);

        try {
            await queueEmail({
                email: user.email,
                subject: 'Security Alert: Password Changed',
                message: `
                <p>Hello ${escapeHtml(user.name || 'User')},</p>
                <p>Your MessMate password was just changed successfully on ${getISTDateString()}.</p>
                <p>If you did not authorize this change, please contact administration immediately.</p>
                <p>Best regards,<br/>The Mess Mate Team<br/>National Institute of Technology, Kurukshetra</p>`,
                dedupeKey: `password-change-email-${user.email}-${Date.now()}`
            });
        } catch (error) {
            console.error("Failed to send password change email:", error);
        }

        res.json({
            message: 'Password changed successfully',
            accessToken: newAccessToken
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 9. LOGOUT
// ==========================================
const logout = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        if (token && req.user?._id) {
            await revokeSession(req.user._id.toString(), token);
            await pruneExpiredSessions(req.user._id.toString());
        }

        res.cookie('refreshToken', '', { httpOnly: true, secure: true, sameSite: 'none', expires: new Date(0) });
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.cookie('refreshToken', '', { httpOnly: true, secure: true, sameSite: 'none', expires: new Date(0) });
        next(error);
    }
};

// ==========================================
// 10. GET ME
// ==========================================
const getMe = async (req, res, next) => {
    const user = req.user;

    try {
        await user.populate('hostel', 'name id');
        res.json(GetMeResponseDTO(user));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 11. Revoke access after access token expires
// ==========================================
const handleRefreshToken = async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return next(new AppError('Not authorized', 401));

    try {
        const userId = await getSessionUser(refreshToken);
        if (!userId) return next(new AppError('Session expired', 401));

        const user = await User.findById(userId);
        if (!user) return next(new AppError('User not found', 401));

        const newAccessToken = await rotateRefreshToken(res, userId, user.role, refreshToken);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
    handleRefreshToken
};