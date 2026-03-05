import api from './api';

export const fetchHostelsAdminAPI = async () => {
    const response = await api.get('/admin/hostels');
    return response.data;
};

export const addHostelAPI = async (hostelData) => {
    const response = await api.post('/admin/hostels', hostelData);
    return response.data;
};

export const updateHostelDetailsAPI = async (id, updatedData) => {
    const response = await api.put(`/admin/hostels/${id}`, updatedData);
    return response.data;
};

export const fetchStudentsByHostelAPI = async (hostelId) => {
    const response = await api.get(`/admin/hostels/${hostelId}/students`);
    return response.data;
};

export const removeAccountsAPI = async (studentIdentifiers) => {
    // Axios DELETE requests require the body payload to be wrapped in a 'data' property
    const response = await api.delete('/admin/students/remove', {
        data: { studentIdentifiers }
    });
    return response.data;
};