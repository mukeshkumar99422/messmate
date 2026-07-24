const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getUserSession } = require('../utils/redisRefreshToken');


// ==========================================
//check if user is logged-in 
// ==========================================
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            req.user = await User.findById(decoded.id);
            return next();
        } catch (error) {
            console.error('Access token error:', error.message);
            return res.status(401).json({ message: 'Session expired' });
        }
    }

    return res.status(401).json({ message: 'Not authorized' });
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
    checkUserExists,
    protect,
    isStudent, isAccountant, isAdmin
};