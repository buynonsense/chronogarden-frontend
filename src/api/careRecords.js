import axios from 'axios';

export const getUserCareRecords = () => {
    return axios.get('/api/carerecords');
};

export const getPlantCareRecords = (plantId) => {
    return axios.get(`/api/carerecords/plant/${plantId}`);
};

export const getUserPlantCareRecords = (plantId) => {
    return axios.get(`/api/carerecords/plant/${plantId}/user`);
};

export const addCareRecord = (record) => {
    return axios.post('/api/carerecords', record);
};

export const updateCareRecord = (id, record) => {
    return axios.put(`/api/carerecords/${id}`, record);
};

export const deleteCareRecord = (id) => {
    return axios.delete(`/api/carerecords/${id}`);
};