const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const Hostel = require('../models/Hostel');

// Helper to determine role based on identifier
const determineRoleFromBackend = (identifier) => {
    if (identifier === 'admin') return 'admin';
    return identifier.includes('@') ? 'student' : 'accountant';
};

// Helper to generate and send OTP
const generateAndSendOTP = async (email, subject, messageTemplate) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Remove any existing OTP for this email
    await Otp.deleteMany({ email });
    // Save new OTP
    await Otp.create({ email, otp: otpCode });

    const message = messageTemplate.replace('{{OTP}}', otpCode);
    await sendEmail({ email, subject, message });
};

// ==========================================
// 1. STANDARD LOGIN (Password) - All Roles
// ==========================================
const login = async (req, res) => {
    const { password } = req.body;

    try {
        const user = req.existingUser;
        // Populate hostel data since the middleware didn't do it
        await user.populate('hostel', 'name');

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        generateToken(res, user._id, user.role);
        res.json({
            _id: user._id,
            name: user.name ? user.name : (user.role === 'admin' ? 'admin' : 'accountant'),
            identifier: user.identifier,
            role: user.role,
            hostelId: user.hostel ? user.hostel._id : null,
            hostelName: user.hostel ? user.hostel.name : null,
            isVerified: user.isVerified,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 2. SIGNUP - Students Only
// ==========================================
const signup = async (req, res) => {
    const { name, identifier, hostel, password } = req.body;

    try {
        const userExists = await User.findOne({ identifier});
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name,
            identifier,
            password: hashedPassword,
            role: 'student',
            hostel
        });

        await generateAndSendOTP(
            identifier, 
            'Mess Mate - Verify Your Account', 
            'Welcome to Mess Mate! Your account verification OTP is: {{OTP}}. It expires in 5 minutes.'
        );

        res.status(201).json({ message: 'Signup successful. Please verify OTP.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 3. VERIFY EMAIL OTP (After Signup)
// ==========================================
const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        req.existingUser.isVerified = true;
        await req.existingUser.save();

        //increament student count in hostel
        const hostel = await Hostel.findById(req.existingUser.hostel);
        if (hostel) {
            hostel.studentCount = (hostel.studentCount || 0) + 1;
            await hostel.save();
        }
        
        // Delete OTP after successful use
        await Otp.deleteMany({ email });

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 4. RESEND OTP
// ==========================================
const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        await generateAndSendOTP(
            email, 
            'Mess Mate - New OTP', 
            'Your new OTP is: {{OTP}}. It expires in 5 minutes.'
        );
        res.json({ message: 'OTP resent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 5. SEND LOGIN OTP (OTP Login Flow)
// ==========================================
const sendLoginOTP = async (req, res) => {
    const { identifier } = req.body;
    try {
        await generateAndSendOTP(
            identifier, 
            'Mess Mate - Login OTP', 
            'Your login OTP is: {{OTP}}. It expires in 5 minutes.'
        );
        res.json({ message: 'Login OTP sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 6. LOGIN WITH OTP
// ==========================================
const loginWithOTP = async (req, res) => {
    const { identifier, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email: identifier, otp });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const user = req.existingUser;
        await user.populate('hostel', 'name');
        
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

        await Otp.deleteMany({ email: identifier });

        generateToken(res, user._id, user.role);
        res.json({
            _id: user._id,
            name: user.name ? user.name : (user.role === 'admin' ? 'admin' : 'accountant'),
            identifier: user.identifier,
            role: user.role,
            hostelId: user.hostel ? user.hostel._id : null,
            hostelName: user.hostel ? user.hostel.name : null,
            isVerified: user.isVerified,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 7. FORGOT PASSWORD FLOW
// ==========================================
const sendForgotPasswordOtp = async (req, res) => {
    const { identifier } = req.body;
    try {
        await generateAndSendOTP(
            identifier, 
            'Mess Mate - Reset Password OTP', 
            'Your password reset OTP is: {{OTP}}. It expires in 5 minutes.'
        );
        res.json({ message: 'Reset OTP sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyForgotPasswordOtp = async (req, res) => {
    const { identifier, otp } = req.body;
    try {
        const otpRecord = await Otp.findOne({ email: identifier, otp });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });
        
        res.json({ message: 'OTP verified, proceed to reset password' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { identifier, otp, newPassword } = req.body;
    try {
        const otpRecord = await Otp.findOne({ email: identifier, otp });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        req.existingUser.password = hashedPassword;
        await req.existingUser.save();

        await Otp.deleteMany({ email: identifier }); // Clean up

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 8. CHANGE PASSWORD (Logged In Users)
// ==========================================
const changePassword = async (req, res) => {
    console.log(1, req.body);
    const { oldPassword, newPassword } = req.body;
    console.log(2);
    try {
        const user = req.user;
        console.log(3);
        if (!(await bcrypt.compare(oldPassword, user.password))) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }
        console.log(4);
        const salt = await bcrypt.genSalt(10);
        console.log(5);
        user.password = await bcrypt.hash(newPassword, salt);
        console.log(6);
        await user.save();
        console.log(7);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 9. LOGOUT
// ==========================================
const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Expire immediately
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
        await user.populate('hostel', 'name');

        res.json({
            _id: user._id,
            name: user.name ? user.name : (user.role === 'admin' ? 'admin' : 'accountant'),
            identifier: user.identifier,
            role: user.role,
            hostelId: user.hostel ? user.hostel._id : null,
            hostelName: user.hostel ? user.hostel.name : null,
            isVerified: user.isVerified,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
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