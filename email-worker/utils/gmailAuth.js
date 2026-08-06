const { redisClient } = require('../config/redis');

const TOKEN_KEY = 'gmail:accessToken';

// L1 cache: fast path within a warm instance
let cachedToken = null;
let tokenExpiresAt = 0;
let refreshPromise = null;

const fetchNewToken = async () => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GMAIL_CLIENT_ID,
            client_secret: process.env.GMAIL_CLIENT_SECRET,
            refresh_token: process.env.GMAIL_REFRESH_TOKEN,
            grant_type: 'refresh_token',
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Gmail token refresh failed: ${data.error_description || data.error}`);
    }

    return { accessToken: data.access_token, expiresIn: data.expires_in };
};

const getAccessToken = async () => {
    const now = Date.now();

    // 1. L1 hit: still valid in this instance's memory
    if (cachedToken && now < tokenExpiresAt - 60_000) {
        return cachedToken;
    }

    // 2. L2 hit: another instance already refreshed it, check Redis
    try {
        const cached = await redisClient.get(TOKEN_KEY);
        if (cached && cached.accessToken && now < cached.expiresAt - 60_000) {
            cachedToken = cached.accessToken;
            tokenExpiresAt = cached.expiresAt;
            return cachedToken;
        }
    } catch (err) {
        console.error('[GmailAuth] Redis read failed, falling back to direct refresh:', err.message);
    }

    // 3. Miss everywhere: refresh, but de-dupe concurrent callers on this instance
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const { accessToken, expiresIn } = await fetchNewToken();
            const expiresAt = Date.now() + expiresIn * 1000;

            cachedToken = accessToken;
            tokenExpiresAt = expiresAt;

            redisClient
                .set(TOKEN_KEY, { accessToken, expiresAt }, { ex: expiresIn })
                .catch(err => console.error('[GmailAuth] Redis write failed:', err.message));

            return accessToken;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

module.exports = { getAccessToken };