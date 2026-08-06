import {apiWithoutCred} from './api';

export const changeHostelAPI = async (newHostelId) => {
    const response = await apiWithoutCred.put('/student/change-hostel', { newHostelId });
    return response.data;
};

export const fetchTodayMenuAPI = async () => {
    const response = await apiWithoutCred.get('/student/menu/today');
    return response.data;
};

export const fetchMenuByDayAPI = async (day) => {
    const response = await apiWithoutCred.get(`/student/menu/day/${day}`);
    return response.data;
};

export const fetchExtrasByDateAPI = async (date, meal) => {
    const response = await apiWithoutCred.get(`/student/extras?date=${date}&meal=${meal}`);
    return response.data;
};

export const addExtraPurchaseAPI = async (data) => {
    const response = await apiWithoutCred.post('/student/purchase', data);
    return response.data;
};

export const fetchAnalyseExtraAPI = async (from, to, groupBy) => {
    let queryStr = '/student/analyse-purchases?';
    if (from) queryStr += `from=${from}&`;
    if (to) queryStr += `to=${to}&`;
    if (groupBy) queryStr += `groupBy=${groupBy}`;
    
    const response = await apiWithoutCred.get(queryStr);
    return response.data;
};

export const addRatingAPI = async (data) => {
    const response = await apiWithoutCred.post('/student/rate', data);
    return response.data;
}