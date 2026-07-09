const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const generateAndSendOTP = require('../utils/generateAndSendOTP');
const Hostel = require('../models/Hostel');

const User = require('../models/User');
const Otp = require('../models/Otp');
const { validatePasswordStrength, getISTDateString } = require('../utils/helpers');


// ==========================================
// 1. STANDARD LOGIN (Password) - All Roles
// ==========================================
const login = async (req, res) => {
    const {password} = req.body;

    if(!password) {
        return res.status(400).json({message: 'All fields are required'});
    }

    const cpassword = String(password);

    try {
        const user = req.existingUser;
        // Populate hostel data since the middleware didn't do it
        await user.populate('hostel', 'name id');

        if (!(await bcrypt.compare(cpassword, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        generateToken(res, user._id, user.role);
        res.json({
            _id: user._id,
            name: user.name ? user.name : (user.role === 'admin' ? 'admin' : 'accountant'),
            identifier: user.identifier,
            email: user.email,
            role: user.role,
            hostelId: user.hostel ? user.hostel.id : null,
            hostelName: user.hostel ? user.hostel.name : null,
            isVerified: user.isVerified,
        });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 2. SIGNUP - Students Only
// ==========================================
const signup = async (req, res) => {
    const { name, identifier, hostel, password } = req.body;

    try {
        //1. check user not already exists
        const userExists = await User.findOne({
            $or: [
                {email: identifier},
                {identifier: identifier}
            ]
        });
        if (userExists) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        //2. check hostel exists
        const hostelExists = await Hostel.findOne({ id: hostel });
        if (!hostelExists) {
            return res.status(400).json({ message: "Specified hostel does not exist" });
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

        await generateAndSendOTP(
            identifier,
            'Your Mess Mate Login Code',
            `<p>Hello,</p>
            <p><strong>Your verification OTP is: {{OTP}}</strong></p>
            <p>This code is valid for the next 5 minutes. If you did not request this, please ignore this email.</p>
            <p>Best regards,<br/>The Mess Mate Team<br/>National Institute of Technology, Kurukshetra</p>`
        );

        res.status(201).json({ message: 'Signup successful. Please verify OTP.' });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 3. VERIFY EMAIL OTP (After Signup)
// ==========================================
const verifyEmail = async (req, res) => {
    const {email, otp} = req.body;

    if(!otp) {
        return res.status(400).json({message: 'All fields are required'});
    }

    const cemail = req.existingUser.email;
    const cotp = String(otp).trim();

    try {
        const otpRecord = await Otp.findOne({ email: cemail, otp: cotp });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        if(req.existingUser.isVerified) {
            return res.status(304).json({ message: 'Email already verified.' });
        }

        req.existingUser.isVerified = true;
        await req.existingUser.save();

        //increament student count in hostel
        await Hostel.findByIdAndUpdate(req.existingUser.hostel, {$inc: {studentCount: 1}});
        
        // Delete OTP after successful use
        await Otp.deleteMany({ email: cemail });

        // --- STUDENT WELCOME EMAIL GENERATION ---

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
        
        <!-- Top Institutional Brand Header Bar -->
        <tr>
            <td style="background-color: #16a34a; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Mess<span style="color: #d1fae5;">Mate</span></h1>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5; font-weight: 500;">Your Smart Campus Dining Companion</p>
            </td>
        </tr>

        <!-- Main Body Content Core -->
        <tr>
            <td style="padding: 40px 30px;">
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #1e293b;">Hello <strong>${req.existingUser.name}</strong>,</p>
                
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
                    Your MessMate student account has been successfully verified and activated! Welcome to a streamlined, modern campus dining experience.
                </p>

                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569;">
                    You can now access your digital dashboard to view live menus, log optional add-on purchases seamlessly, track your dining expenses with interactive analytics charts, and submit food quality ratings directly to the mess committee.
                </p>

                <!-- Central Call-To-Action Button Block -->
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

        <!-- Standard Compliant Transactional Footer -->
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

        await sendEmail({
                email: cemail,
                subject: welcomeSubject,
                message: welcomeMessage
            });
        
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 4. RESEND OTP
// ==========================================
const resendOtp = async (req, res) => {
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
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 5. SEND LOGIN OTP (OTP Login Flow)
// ==========================================
const sendLoginOTP = async (req, res) => {
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
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 6. LOGIN WITH OTP
// ==========================================
const loginWithOTP = async (req, res) => {
    const {identifier, otp} = req.body;

    if(!otp) {
        return res.status(400).json({message: 'All fields are required'});
    }
    const cotp = String(otp).trim();

    const email = req.existingUser.email;

    try {
        const otpRecord = await Otp.findOne({ email: email, otp: cotp });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const user = req.existingUser;
        await user.populate('hostel', 'name id');
        
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();

            //increament student count in hostel
            const hostel = await Hostel.findById(user.hostel);
            if (hostel) {
                hostel.studentCount = (hostel.studentCount || 0) + 1;
                await hostel.save();
            }
        }

        await Otp.deleteMany({ email: email });

        generateToken(res, user._id, user.role);
        res.json({
            _id: user._id,
            name: user.name ? user.name : (user.role === 'admin' ? 'admin' : 'accountant'),
            identifier: user.identifier,
            email: user.email,
            role: user.role,
            hostelId: user.hostel ? user.hostel.id : null,
            hostelName: user.hostel ? user.hostel.name : null,
            isVerified: user.isVerified,
        });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 7. FORGOT PASSWORD FLOW
// ==========================================
const sendForgotPasswordOtp = async (req, res) => {
    const email = req.existingUser.email;

    try {
        await generateAndSendOTP(
            email, 
            'Mess Mate - Reset Password OTP', 
            'Your password reset OTP is: {{OTP}}. It expires in 5 minutes.'
            `<p>Hello,</p>
            <p>You requested to reset your password for your Mess Mate account.</p>
            <p><strong>Your password reset OTP is: {{OTP}}</strong></p>
            <p>This code is valid for the next 5 minutes. If you did not request this, please ignore this email.</p>
            <p>Best regards,<br/>The Mess Mate Team<br/>National Institute of Technology, Kurukshetra</p>`
        );
        res.json({ message: 'Reset OTP sent' });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

const verifyForgotPasswordOtp = async (req, res) => {
    const {identifier, otp} = req.body;

    if(!otp) {
        return res.status(400).json({message: 'All fields are required'});
    }

    const email = req.existingUser.email;
    const cotp = String(otp).trim();

    try {
        const otpRecord = await Otp.findOne({ email: email, otp: cotp });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });
        
        res.json({ message: 'OTP verified, proceed to reset password' });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

const resetPassword = async (req, res) => {
    const {identifier, otp, newPassword} = req.body;

    if(!otp || !newPassword) {
        return res.status(400).json({message: 'All fields are required'});
    }
    
    const email = req.existingUser.email;
    const cotp = String(otp).trim();
    const cnewPassword = String(newPassword);

    try {
        const otpRecord = await Otp.findOne({ email: email, otp: cotp });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        if(!validatePasswordStrength(cnewPassword)) {
            return res.status(400).json({ 
                message: 'New password must be less than 72 characters and strong enough.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(cnewPassword, salt);

        req.existingUser.password = hashedPassword;
        await req.existingUser.save();

        await Otp.deleteMany({ email: email }); // Clean up

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 8. CHANGE PASSWORD (Logged In Users)
// ==========================================
const changePassword = async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    if(!oldPassword || !newPassword) {
        return res.status(400).json({message: 'All fields are required'});
    }

    const coldPassword = String(oldPassword);
    const cnewPassword = String(newPassword);

    try {
        const user = req.user;
        if (!(await bcrypt.compare(coldPassword, user.password))) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        if (!validatePasswordStrength(cnewPassword)) {
            return res.status(400).json({ 
                message: 'New password must be less than 72 characters and strong enough.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(cnewPassword, salt);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
    }
};

// ==========================================
// 9. LOGOUT
// ==========================================
const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// ==========================================
// 10. GET ME (Check Session on Page Reload)
// ==========================================
const getMe = async (req, res) => {
    try {
        // req.user is already fetched by the 'protect' middleware
        const user = req.user;
        await user.populate('hostel', 'name id');

        res.json({
            _id: user._id,
            name: user.name ? user.name : (user.role === 'admin' ? 'admin' : 'accountant'),
            identifier: user.identifier,
            email: user.email,
            role: user.role,
            hostelId: user.hostel ? user.hostel.id : null,
            hostelName: user.hostel ? user.hostel.name : null,
            isVerified: user.isVerified,
        });
    } catch (error) {
        res.status(500).json({ message: error.message.toString().length > 50 ? "Server Error" : error.message });
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
    getMe
};