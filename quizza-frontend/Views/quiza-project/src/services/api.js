import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API;
console.log("API URL:", API_BASE_URL); 
// Create a connection with both frontend and backend
const api = axios.create({
  baseURL: API_BASE_URL, // Points to your backend
  withCredentials: true // For cookies/auth
});

// Add request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;