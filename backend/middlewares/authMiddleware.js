const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getUserSession } = require('../utils/token/redisRefreshToken');
const AppError = require('../utils/appError');

// ==========================================
//check if user is logged-in (having access token)
// ==========================================
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            req.user = await User.findById(decoded.id);
            if (!req.user) {
                return next(new AppError('User account no longer exists', 401, 'USER_NOT_FOUND'));
            }
            if (!req.user.isVerified) {
                return next(new AppError('Email verification is required', 403, 'EMAIL_UNVERIFIED'));
            }
            return next();
        } catch (error) {
            console.error('Access token error:', error.message);
            return next(new AppError('Your session has expired', 401, 'SESSION_EXPIRED'));
        }
    }

    return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
};

// ==========================================
// check if user exists
// ==========================================
const checkUserExists = async (req, res, next) => {
    const identifierToCheck = req.body.email || req.body.identifier;
    
    if (!identifierToCheck) {
        return next(new AppError('Email or identifier is required', 400, 'IDENTIFIER_REQUIRED'));
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
            return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
        }

        // Attach the user to the request object so your controllers don't have to search the database again!
        req.existingUser = user;

        // User exists, proceed to the actual controller logic
        next();
    } catch (error) {
        next(error);
    }
};


//student role
const isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        return next(
            new AppError( 'Not authorized as student', 403, 'FORBIDDEN' )
        );
    }
};

//accountant role
const isAccountant = (req, res, next) => {
    if (req.user && req.user.role === 'accountant') {
        next();
    } else {
        return next(
            new AppError( 'Not authorized as accountant', 403, 'FORBIDDEN' )
        );
    }
};

// admin role
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return next(
            new AppError( 'Not authorized as admin', 403, 'FORBIDDEN' )
        );
    }
};

module.exports = { 
    checkUserExists,
    protect,
    isStudent, isAccountant, isAdmin
};