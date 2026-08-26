import axios from 'axios';
import { matchesPath } from '../../utils/helpers';

const NO_REFRESH_PATHS = ['/auth/refresh', '/auth/login', '/auth/signup', '/auth/login-with-otp'];

//------------------define clients------------------

// Main client - needs cookies (login, logout, change-password, refresh)
const authApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// Feature client - no cookies needed, access token(bearer token) only
export const protectedApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: false,
});

// public api- no need of cookie/access token (get hostels, signup)
export const publicApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: false,
})

// has NO interceptors attached,
// so can never recurse into another refresh attempt.
const refreshApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

//----------define tokens----------------------
//access token
export let memoryAccessToken = null;
export const setMemoryToken = (token) => { memoryAccessToken = token; };

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
 * Refreshing the access token.
 * @returns {Promise<string>} the new access token
 */
const refreshAccessToken = async () => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;

    try {
        let response;
        response = await refreshApi.post('/auth/refresh');

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
[authApi, protectedApi].forEach((instance) => {
    // request: attach bearer token
    instance.interceptors.request.use((config) => {
        if (memoryAccessToken) config.headers.Authorization = `Bearer ${memoryAccessToken}`;
        return config;
    }, (error) => Promise.reject(error));

    // response: silent access-token refresh
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

            // <ACCESS TOKEN SILENT REFRESH>
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true; // set BEFORE awaiting, prevents retry loops for this request

                // try {
                //     const newAccessToken = await refreshAccessToken();
                //     originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                //     return instance(originalRequest);
                // } catch {
                //     // request's caller should not show it's own error popup
                //     // bcs session is expired => user forced logout and navigated to /login
                //     // therefore should not return any error
                //     const NEVER_SETTLES = new Promise(() => {});
                //     return NEVER_SETTLES;
                // }
                const newAccessToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return instance(originalRequest);
            }

            return Promise.reject(error);
        }
    );
});

export default authApi;