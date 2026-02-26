import api from './api';

export const fetchHostelsAPI = async () => {
    const response = await api.get('/hostels');
    return response.data;
};

export const loginAPI = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const signupAPI = async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
};

export const verifyEmailAPI = async (data) => {
    const response = await api.post('/auth/verify-email',data);
    return response.data;
}

export const resendOtpAPI = async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
}

export const sendLoginOtpAPI = async (identifier) => {
    const response = await api.post('/auth/send-login-otp', { identifier });
    return response.data;
}

export const loginWithOtpAPI = async (data) => {
    const response = await api.post('/auth/login-with-otp', data);
    return response.data;
}

export const sendForgotPasswordOtpAPI = async (identifier) => {
    const response = await api.post('/auth/forgot-password/send-otp', { identifier });
    return response.data;
}

export const verifyForgotPasswordOtpAPI = async (data) => {
    const response = await api.post('/auth/forgot-password/verify-otp', data);
    return response.data;
}

export const resetPasswordAPI = async (data) => {
    const response = await api.post('/auth/forgot-password/reset', data);
    return response.data;
}

export const changePasswordAPI = async (data) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
}

export const logoutAPI = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const getMeAPI = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};