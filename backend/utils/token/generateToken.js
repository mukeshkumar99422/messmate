const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createSession, rotateSession } = require('./redisRefreshToken');
const isProd = process.env.NODE_ENV === 'production';
const SESSION_TTL = 3 * 24 * 60 * 60;
const refreshCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: SESSION_TTL * 1000,
};

const signAccessToken = (id, role) =>
    jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '5m' });
//NOTE: here no need of jwt token for refresh token, as storing user data in redis storage
const generateSessionToken = () => crypto.randomBytes(48).toString('hex');

/**
 * add session to redis (long live) and generate access token (short live)
 * @param {express response object} res 
 * @param {ObjectId} id 
 * @param {[student, accountant, admin]} role 
 * @returns access token
 */
const generateTokens = async (res, id, role) => {
    const accessToken = signAccessToken(id, role);
    const sessionToken = generateSessionToken();
    await createSession(id.toString(), sessionToken);

    res.cookie('refreshToken', sessionToken, refreshCookieOptions);
    return accessToken;
};

/**
 * rotate the refresh token
 * @param {express response object} res 
 * @param {ObjectId} id 
 * @param {[student, accountant, admin]} role 
 * @param {string} Otoken old token
 * @returns access token
 */
const rotateRefreshToken = async (res, id, role, oldToken) => {
    const accessToken = signAccessToken(id, role);
    const newToken = generateSessionToken();

    await rotateSession(id, oldToken, newToken);

    res.cookie(
        'refreshToken',
        newToken,
        refreshCookieOptions
    );

    return accessToken;
};

/**
 * regenerate only access token (on expiry)
 * @param {ObjectId} id 
 * @param {[student, accountant, admin]} role 
 * @returns access token
 */
const reissueAccessToken = (id, role) => signAccessToken(id, role);

module.exports = { generateTokens, rotateRefreshToken, reissueAccessToken };