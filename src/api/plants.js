import axios from 'axios';

export const getPlants = () => {
    return axios.get('/api/plants');
};

export const getPlantById = (id) => {
    return axios.get(`/api/plants/${id}`);
};

export const getPlantsByEra = (era) => {
    return axios.get(`/api/plants/era/${encodeURIComponent(era)}`);
};

export const createPlant = (plant) => {
    return axios.post('/api/plants', plant);
};

export const updatePlant = (id, plant) => {
    return axios.put(`/api/plants/${id}`, plant);
};

export const deletePlant = (id) => {
    return axios.delete(`/api/plants/${id}`);
};

// 支持通过timeNodeId或直接通过era字符串查询
export const getPlantsByTimeNodeOrEra = (params) => {
    if (params.timeNodeId) {
        // 先获取timeNode，然后用其name作为era查询
        return axios.get(`/api/timenodes/${params.timeNodeId}`)
            .then(response => {
                const eraName = response.data.name;
                return axios.get(`/api/plants/era/${encodeURIComponent(eraName)}`);
            });
    } else if (params.era) {
        // 直接通过era查询
        return axios.get(`/api/plants/era/${encodeURIComponent(params.era)}`);
    }
    // 如果都没提供，返回全部
    return getPlants();
};