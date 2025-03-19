import axios from 'axios'

export const login = (userData) => {
  return axios.post('/api/users/login', userData)
}

export const register = (userData) => {
  return axios.post('/api/users/register', userData)
}