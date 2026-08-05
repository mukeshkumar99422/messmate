import axios from 'axios';
import { matchesPath } from '../../utils/helpers';

const CSRF_PROTECTED_PATHS = ['/auth/login', '/auth/signup', '/auth/login-with-otp', '/auth/refresh'];
const NO_REFRESH_PATHS = ['/auth/refresh', '/auth/login', '/auth/signup', '/auth/login-with-otp', '/auth/me'];

//------------------define clients------------------

// Main client - needs cookies (csrf-protected auth routes, get-me, logout, change-password, refresh)
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// Feature client - no cookies needed, Bearer token only
export const apiWithoutCred = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: false,
});

// has NO interceptors attached,
// so can never recurse into another refresh attempt.
const rawApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

//----------define tokens----------------------
//access token
let memoryAccessToken = null;
export const setMemoryToken = (token) => { memoryAccessToken = token; };

//csrf token
let csrfToken = null;
export const setCsrfToken = (token) => { csrfToken = token; };
export const initCsrfToken = async () => {
    const res = await api.get('/csrf-token');
    setCsrfToken(res.data.csrfToken);
};

// -----------------CONCURRENCY LOCK VARIABLES----------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

/**
 * Called only when the refresh token itself is confirmed invalid/expired
 */
const forceLogout = () => {
    setMemoryToken(null);
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
};

/**
 * Single source of truth for refreshing the access token.
 * @returns {Promise<string>} the new access token
 */
const refreshAccessToken = async () => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;

    const doRefreshCall = async () => {
        const headers = {};
        if (csrfToken) headers['x-csrf-token'] = csrfToken;
        return rawApi.post('/auth/refresh', {}, { headers });
    };

    try {
        let response;
        try {
            response = await doRefreshCall();
        } catch (err) {
            // Self-heal a stale/missing CSRF token once, then give up for real.
            const isCsrfError = err.response?.status === 403 &&
                (err.response?.data?.code === 'EBADCSRFTOKEN' ||
                 err.response?.data?.message?.toLowerCase().includes('csrf'));

            if (!isCsrfError) throw err;

            await initCsrfToken();
            response = await doRefreshCall();
        }

        const { accessToken } = response.data;
        setMemoryToken(accessToken);
        processQueue(null, accessToken);
        return accessToken;
    } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        throw refreshError;
    } finally {
        isRefreshing = false;
    }
};

//-----------------interceptors----------------
[api, apiWithoutCred].forEach((instance) => {
    // request: attach csrf header (only where needed) + bearer token
    instance.interceptors.request.use((config) => {
        const needsCsrf = matchesPath(config.url, CSRF_PROTECTED_PATHS);
        if (csrfToken && needsCsrf) config.headers['x-csrf-token'] = csrfToken;
        if (memoryAccessToken) config.headers.Authorization = `Bearer ${memoryAccessToken}`;
        return config;
    }, (error) => Promise.reject(error));

    // response: csrf self-heal + silent access-token refresh
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // No config at all (e.g. network error with no request context)
            if (!originalRequest) return Promise.reject(error);

            // Never attempt refresh logic around auth-plumbing routes themselves
            if (matchesPath(originalRequest.url, NO_REFRESH_PATHS)) {
                return Promise.reject(error);
            }

            // <CSRF TOKEN SELF-HEAL>
            const isCsrfError = error.response?.status === 403 &&
                (error.response?.data?.code === 'EBADCSRFTOKEN' ||
                 error.response?.data?.message?.toLowerCase().includes('csrf'));

            if (isCsrfError && !originalRequest._csrfRetry) {
                originalRequest._csrfRetry = true;
                try {
                    await initCsrfToken();
                    originalRequest.headers['x-csrf-token'] = csrfToken;
                    return instance(originalRequest);
                } catch (e) {
                    return Promise.reject(e);
                }
            }

            // <ACCESS TOKEN SILENT REFRESH>
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true; // set BEFORE awaiting, prevents retry loops for this request

                try {
                    const newAccessToken = await refreshAccessToken();
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);
                } catch {
                    // request's caller should not show it's own error popup
                    // bcs session is expired => user forced logout and navigated to /login
                    // therefore should not return any error
                    const NEVER_SETTLES = new Promise(() => {});
                    return NEVER_SETTLES;
                }
            }

            return Promise.reject(error);
        }
    );
});

export default api;