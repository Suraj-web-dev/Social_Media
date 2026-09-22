import axios from "axios";

const getBaseURL = () => {
  let url =
    import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.PROD
      ? "https://insta-srx2.onrender.com/api"
      : "http://localhost:5000/api");

  url = url.trim().replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;