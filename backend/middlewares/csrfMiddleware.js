const { doubleCsrf } = require('csrf-csrf');
const crypto = require('crypto');

const isProd = process.env.NODE_ENV === 'production';

const {
    generateCsrfToken,
    doubleCsrfProtection,
    invalidCsrfTokenError,
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET,

    getSessionIdentifier: (req) => req.cookies?.csrfSid || '',

    cookieName: isProd ? '__Host-psifi.x-csrf-token' : 'x-csrf-token',
    cookieOptions: {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax', //override strict(default) as front, back have diff origins
        secure: isProd,
        path: '/',
    },

    getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

/**
 * Ensures every req has a stable anonymous identifier cookie
 * before a CSRF token is generated
 */
const ensureCsrfSid = (req, res, next) => {
    if (!req.cookies?.csrfSid) {
        const sid = crypto.randomUUID();
        res.cookie('csrfSid', sid, {
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
            path: '/',
            maxAge: 365 * 24 * 60 * 60 * 1000,
        });
        req.cookies.csrfSid = sid;
    }
    next();
};

module.exports = { generateCsrfToken, doubleCsrfProtection, invalidCsrfTokenError, ensureCsrfSid };