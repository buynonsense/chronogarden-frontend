import axios from 'axios'

export const getUserCareRecords = () => {
  return axios.get('/api/carerecords')
}

export const getPlantCareRecords = (plantId) => {
  return axios.get(`/api/carerecords/plant/${plantId}`)
}

export const getUserPlantCareRecords = (plantId) => {
  return axios.get(`/api/carerecords/plant/${plantId}/user`)
}

export const addCareRecord = (careRecord) => {
  return axios.post('/api/carerecords', careRecord)
}

export const updateCareRecord = (id, careRecord) => {
  return axios.put(`/api/carerecords/${id}`, careRecord)
}

export const deleteCareRecord = (id) => {
  return axios.delete(`/api/carerecords/${id}`)
}