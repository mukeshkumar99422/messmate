import {apiWithoutCred} from './api';

export const fetchHostelsAdminAPI = async () => {
    const response = await apiWithoutCred.get('/admin/hostels');
    return response.data;
};

export const addHostelAPI = async (hostelData) => {
    const response = await apiWithoutCred.post('/admin/hostels', hostelData);
    return response.data;
};

export const updateHostelDetailsAPI = async (hostelId, updatedData) => {
    const response = await apiWithoutCred.put(`/admin/hostels/${hostelId}`, updatedData);
    return response.data;
};

export const sendRemoveHostelOtpAPI = async (hostelId) => {
    const response = await apiWithoutCred.post(`/admin/hostels/${hostelId}/remove/send-otp`);
    return response.data;
};

export const removeHostelAPI = async (hostelId, otp) => {
    const response = await apiWithoutCred.delete(`/admin/hostels/${hostelId}/remove`, {
        data: { otp }
    });
    return response.data;
};

export const fetchStudentsByHostelAPI = async (hostelId) => {
    const response = await apiWithoutCred.get(`/admin/hostels/${hostelId}/students`);
    return response.data;
};

export const sendRemoveAccountsOtpAPI = async (hostelId) => {
    const response = await apiWithoutCred.post(`/admin/hostels/${hostelId}/students/remove/send-otp`);
    return response.data;
};

export const removeAccountsAPI = async (hostelId, studentIdentifiers, otp) => {
    // Axios DELETE requests require the body payload to be wrapped in a 'data' property
    const response = await apiWithoutCred.delete(`/admin/hostels/${hostelId}/students/remove`, {
        data: { studentIdentifiers, otp }
    });
    return response.data;
};