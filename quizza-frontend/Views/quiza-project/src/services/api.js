import axios from "axios";

// Create a connection with both frontend and backend
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Points to your backend
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