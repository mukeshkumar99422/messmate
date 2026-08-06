const jwt = require('jsonwebtoken');
const { saveUserSession } = require('./redisRefreshToken');

const isProd = process.env.NODE_ENV === 'production';

const refreshCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax', //as domain names are different for frontend and backend in deployment.
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signAccessToken = (id, role) =>
    jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });


/**
 * Full rotation: use ONLY on login and the actual /refresh endpoint. 
 * save refresh token(res-cookie + redis) and return access token
 * @param {express response object} res 
 * @param {mongoose object id} id 
 * @param {[student, accountant, admin]} role 
 * @returns {access token}
 */
const generateTokens = async (res, id, role) => {
    const accessToken = signAccessToken(id, role);
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Don't hand out a cookie for a session the server can't later validate
    await saveUserSession(id.toString(), refreshToken);

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    return accessToken;
};

/**
 * Use for routes that just need to prove "still logged in" (e.g. GET /me). 
 * Does NOT touch Redis or the refresh cookie
 * @param {*} id 
 * @param {*} role 
 * @returns 
 */
const reissueAccessToken = (id, role) => signAccessToken(id, role);

module.exports = { generateTokens, reissueAccessToken };