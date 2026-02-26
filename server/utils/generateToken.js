const jwt = require('jsonwebtoken');

const generateToken = (res, id, role) => {
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('token', token, {
        httpOnly: true, // Prevents client-side JS from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });
};

module.exports = generateToken;