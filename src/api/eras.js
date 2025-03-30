import axios from 'axios';

export const getEras = () => {
    return axios.get('/api/eras');
};

export const getEraById = (id) => {
    return axios.get(`/api/eras/${id}`);
};

export const getErasByPeriod = (period) => {
    return axios.get(`/api/eras/period/${encodeURIComponent(period)}`);
};

export const createEra = (era) => {
    return axios.post('/api/eras', era);
};

export const updateEra = (id, era) => {
    return axios.put(`/api/eras/${id}`, era);
};

export const deleteEra = (id) => {
    return axios.delete(`/api/eras/${id}`);
};