const jwt = require('jsonwebtoken');
const User = require('../models/User');


//if user is logged in
const protect = async (req, res, next) => {
    let token;    
    token = req.cookies.token;
    console.log(1)

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
            console.log(2)
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.error('No token found in cookies');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

//student role
const isStudent = (req, res, next) => {
    console.log(3)
    if (req.user && req.user.role === 'student') {
        console.log(4)
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a student' });
    }
};

//if user exists or not
const checkUserExists = async (req, res, next) => {
    // Check for either 'email' or 'identifier' depending on what the frontend sends
    const identifierToCheck = req.body.email || req.body.identifier;

    if (!identifierToCheck) {
        return res.status(400).json({ message: 'Email or identifier is required' });
    }

    try {
        // Look up the user by their identifier
        const user = await User.findOne({ identifier: identifierToCheck });

        if (!user) {
            return res.status(404).json({ message: 'User not found. Please sign up first.' });
        }

        // Optional but highly recommended: 
        // Attach the user to the request object so your controllers don't have to search the database again!
        req.existingUser = user; 

        // User exists, proceed to the actual controller logic
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while checking user status' });
    }
};

module.exports = { protect, isStudent, checkUserExists };