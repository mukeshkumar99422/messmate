import api from './api';

export const changeHostelAPI = async (newHostelId) => {
    const response = await api.put('/student/change-hostel', { newHostelId });
    return response.data;
};

export const fetchTodayMenuAPI = async () => {
    const response = await api.get('/student/menu/today');
    return response.data;
};

export const fetchMenuByDayAPI = async (day) => {
    const response = await api.get(`/student/menu/day/${day}`);
    return response.data;
};

export const fetchExtrasByDateAPI = async (date, meal) => {
    const response = await api.get(`/student/extras?date=${date}&meal=${meal}`);
    return response.data;
};

export const addExtraPurchaseAPI = async (data) => {
    const response = await api.post('/student/purchase', data);
    return response.data;
};

export const fetchAnalyseExtraAPI = async (from, to) => {
    let queryStr = '/student/analyse-purchases?';
    if (from) queryStr += `from=${from}&`;
    if (to) queryStr += `to=${to}`;
    
    const response = await api.get(queryStr);
    return response.data;
};