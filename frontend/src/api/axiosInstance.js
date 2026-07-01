import axios from 'axios';

const api = axios.create({
  // Point straight to the Django Backend
  baseURL: 'http://127.0.0.1:8000/api/clinic/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach the token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
