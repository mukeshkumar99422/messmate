import api from './api';

export const fetchTodayMenuAPI = async () => {
    const response = await api.get('/accountant/menu/today');
    return response.data;
};

export const fetchWeeklyMenuAPI = async () => {
    const response = await api.get('/accountant/menu/weekly');
    return response.data;
};

export const updateTodayMenuAPI = async (data) => {
    const response = await api.put('/accountant/menu/today', data);
    return response.data;
};

export const uploadWeeklyMenuAPI = async (data) => {
    const response = await api.post('/accountant/menu/weekly', data);
    return response.data;
};

export const extractWeeklyMenuFromImageAPI = async (formData) => {
    // We MUST tell Axios we are sending a file (multipart/form-data)
    const response = await api.post('/accountant/menu/extract', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};