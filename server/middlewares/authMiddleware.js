const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const { validateNITKKREmail, validatePasswordStrength } = require('../utils/helpers');


// ==========================================
//check if user is logged-in 
// ==========================================
const protect = async (req, res, next) => {
    let token;    
    token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            //check is user verified or not
            if (!user.isVerified) {
                return res.status(403).json({ message: 'Account not verified.' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.error('No token found in cookies');
        res.status(401).json({ message: 'Not authorized' });
    }
};

// ==========================================
// check if user exists
// ==========================================
const checkUserExists = async (req, res, next) => {
    const identifierToCheck = req.body.email || req.body.identifier;
    
    if (!identifierToCheck) {
        return res.status(400).json({ message: 'Email or identifier is required' });
    }

    const cIdentifierToCheck = String(identifierToCheck).trim().toLowerCase();

    try {
        // Look up the user by their identifier OR email
        const user = await User.findOne({
            $or: [
                { identifier: cIdentifierToCheck },
                { email: cIdentifierToCheck }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Attach the user to the request object so your controllers don't have to search the database again!
        req.existingUser = user;

        // User exists, proceed to the actual controller logic
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while checking user status' });
    }
};

// ==========================================
// validate signup data
// ==========================================
const validateSignupData = async (req, res, next) => {
    const {name, identifier, hostel, password} = req.body;
    //1. check existance of all required fields
    if (!name || !identifier || !hostel || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    //2. clean data
    const cName = String(name).trim();
    const cIdentifier = String(identifier).trim();
    const cHostel = Number(hostel);
    const cPassword = String(password);

    
    //3. check identifier format
    if (!validateNITKKREmail(cIdentifier)) {
        return res.status(400).json({ message: "Please provide a valid email id" });
    }

    

    //5. validate password using shared helper
    if (!validatePasswordStrength(cPassword)) {
        return res.status(400).json({ message: "Invalid password format." });
    }

    req.body = { name: cName, identifier: cIdentifier, hostel: cHostel, password: cPassword };

    next();
};

//student role
const isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a student' });
    }
};

//accountant role
const isAccountant = (req, res, next) => {
    if (req.user && req.user.role === 'accountant') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an accountant' });
    }
};

// admin role
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { 
    validateSignupData,
    checkUserExists,
    protect,
    isStudent, isAccountant, isAdmin
};