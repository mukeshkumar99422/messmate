import axios from 'axios';

//define access token in memory
let memoryAccessToken = null;
export const setMemoryToken = (token) => {
    memoryAccessToken = token;
};

//define main client
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// define refresh client for refreshing acccess token
const refreshClient = axios.create({
    baseURL: api.defaults.baseURL,
    withCredentials: true,
});


// --- CONCURRENCY LOCK VARIABLES ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// intercepts request
api.interceptors.request.use(
    (config) => {
        if (memoryAccessToken) {
            config.headers.Authorization = `Bearer ${memoryAccessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//intercept response
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // No config at all (e.g. network error with no request context) — bail out safely
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Block interception for the auth routes
        if ( originalRequest.url.includes('/auth/') ) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                // A refresh is already in progress — queue this request until it resolves
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Renew the access token using the httpOnly refresh cookie
                const response = await refreshClient.post('/auth/refresh');

                const { accessToken } = response.data;
                setMemoryToken(accessToken);

                // Release the queue and resolve pending requests
                processQueue(null, accessToken);

                // Re-fire the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Reject all queued requests
                processQueue(refreshError, null);
                setMemoryToken(null);

                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;