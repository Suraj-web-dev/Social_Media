import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL
  let url = envUrl || (import.meta.env.PROD ? 'https://social-media-0121.onrender.com' : 'http://localhost:5000')
  url = url.trim().replace(/\/+$/, '')
  if (!url.endsWith('/api')) {
    url = `${url}/api`
  }
  return url
}

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
})

// Attach Bearer token from localStorage for seamless cross-domain auth
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default API
