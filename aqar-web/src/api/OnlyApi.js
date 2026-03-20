import axios from 'axios'

const BACKEND = 'https://naac-navigator.onrender.com'

const api = axios.create({ baseURL: BACKEND })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api