const jwt = require('jsonwebtoken');

const generateToken = (res, id, role) => {
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });
};

module.exports = generateToken;