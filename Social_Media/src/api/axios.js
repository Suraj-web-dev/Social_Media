import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL
  let url = envUrl || (import.meta.env.PROD ? 'https://insta-srx2.onrender.com' : 'http://localhost:5000')
  url = url.trim().replace(/\/+$/, '')
  // Auto-fix typo if 0121 is passed in Render dashboard environment variables
  url = url.replace('social-media-0121.onrender.com', 'social-media-012l.onrender.com')
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