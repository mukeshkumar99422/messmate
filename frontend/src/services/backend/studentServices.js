import {protectedApi} from './api';

export const changeHostelAPI = async (newHostelId, idempotencyKey) => {
    const response = await protectedApi.put('/student/change-hostel', { newHostelId }, {headers: {'Idempotency-Key': idempotencyKey}});
    return response.data;
};

export const fetchTodayMenuAPI = async () => {
    const response = await protectedApi.get('/student/menu/today');
    return response.data;
};

export const fetchMenuByDayAPI = async (day) => {
    const response = await protectedApi.get(`/student/menu/day/${day}`);
    return response.data;
};

export const fetchExtrasByDateAPI = async (date, meal) => {
    const response = await protectedApi.get(`/student/extras?date=${date}&meal=${meal}`);
    return response.data;
};

export const addExtraPurchaseAPI = async (data, idempotencyKey) => {
    const response = await protectedApi.post('/student/purchase', data, {headers: {'Idempotency-Key': idempotencyKey}});
    return response.data;
};

export const fetchAnalyseExtraAPI = async (from, to, groupBy) => {
    let queryStr = '/student/analyse-purchases?';
    if (from) queryStr += `from=${from}&`;
    if (to) queryStr += `to=${to}&`;
    if (groupBy) queryStr += `groupBy=${groupBy}`;
    
    const response = await protectedApi.get(queryStr);
    return response.data;
};

export const addRatingAPI = async (data, idempotencyKey) => {
    const response = await protectedApi.post('/student/rate', data, {headers: {'Idempotency-Key': idempotencyKey}});
    return response.data;
}