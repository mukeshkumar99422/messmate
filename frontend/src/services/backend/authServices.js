import authApi from './api';
import { protectedApi, publicApi } from './api';

export const fetchHostelsAPI = async () => {
    const response = await publicApi.get('/hostels');
    return response.data;
};

export const loginAPI = async (credentials) => {
    const response = await authApi.post('/auth/login', credentials);
    return response.data;
};

export const signupAPI = async (userData) => {
    const response = await publicApi.post('/auth/signup', userData);
    return response.data;
};

export const verifyEmailAPI = async (data) => {
    const response = await protectedApi.post('/auth/verify-email',data);
    return response.data;
}

export const resendOtpAPI = async (email) => {
    const response = await protectedApi.post('/auth/resend-otp', { email });
    return response.data;
}

export const sendLoginOtpAPI = async (identifier) => {
    const response = await protectedApi.post('/auth/send-login-otp', { identifier });
    return response.data;
}

export const loginWithOtpAPI = async (data) => {
    const response = await authApi.post('/auth/login-with-otp', data);
    return response.data;
}

export const sendForgotPasswordOtpAPI = async (identifier) => {
    const response = await protectedApi.post('/auth/forgot-password/send-otp', { identifier });
    return response.data;
}

export const verifyForgotPasswordOtpAPI = async (data) => {
    const response = await protectedApi.post('/auth/forgot-password/verify-otp', data);
    return response.data;
}

export const resetPasswordAPI = async (data) => {
    const response = await protectedApi.post('/auth/forgot-password/reset', data);
    return response.data;
}

export const changePasswordAPI = async (data) => {
    const response = await authApi.post('/auth/change-password', data);
    return response.data;
}

export const logoutAPI = async () => {
    const response = await authApi.post('/auth/logout');
    return response.data;
};

export const getMeAPI = async () => {
    const response = await protectedApi.get('/auth/me');
    return response.data;
};