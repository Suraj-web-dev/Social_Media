import axios from "axios";

const API = axios.create({
  baseURL: "https://social-media-iv1q-56sz5sb2j-suraj-a081.vercel.app/api",
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