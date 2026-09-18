import axios from 'axios'

const API = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.PROD
      ? 'https://social-media-0121.onrender.com/api'
      : 'http://localhost:5000/api'),
  withCredentials: true,
})

export default API
