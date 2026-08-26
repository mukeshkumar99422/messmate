import {protectedApi}  from './api';

export const fetchTodayMenuAPI = async () => {
    const response = await protectedApi.get('/accountant/menu/today');
    return response.data;
};

export const fetchWeeklyMenuAPI = async () => {
    const response = await protectedApi.get('/accountant/menu/weekly');
    return response.data;
};

export const updateTodayMenuAPI = async (data) => {
    const response = await protectedApi.put('/accountant/menu/today', data);
    return response.data;
};

export const updateItemPriceAPI = async (data) => {
    const response = await protectedApi.patch('/accountant/item/price', data);
    return response.data;
};

export const uploadWeeklyMenuAPI = async (data) => {
    const response = await protectedApi.post('/accountant/menu/weekly', data);
    return response.data;
};

export const extractWeeklyMenuFromImageAPI = async (formData) => {
    // We MUST tell Axios we are sending a file (multipart/form-data)
    const response = await protectedApi.post('/accountant/menu/extract', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Communicates with backend endpoints to get cached or fresh AI summary analytics reviews
 * @param {boolean} forceFresh - Overwrite query flag parameter
 */
export const fetchOrGenerateReviewAnalysisAPI = async (forceFresh = false) => {
    const response = await protectedApi.get(`/accountant/reviews/analyse?fresh=${forceFresh}`);
    return response.data;
};