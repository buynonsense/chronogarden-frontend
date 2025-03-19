import axios from 'axios'

export const getPlants = () => {
  return axios.get('/api/plants')
}

export const getPlantsByTimeNode = (timeNodeId) => {
  return axios.get(`/api/plants/timenode/${timeNodeId}`)
}

export const getPlantById = (id) => {
  return axios.get(`/api/plants/${id}`)
}