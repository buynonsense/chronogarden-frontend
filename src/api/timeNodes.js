import axios from 'axios'

export const getTimeNodes = () => {
  return axios.get('/api/timenodes')
}

export const getTimeNodeById = (id) => {
  return axios.get(`/api/timenodes/${id}`)
}