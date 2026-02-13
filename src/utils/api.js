import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: 'https://api.ruangotp.site/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    try {
      const decoded = jwtDecode(token);
      if (decoded.userId) {
        config.headers['x-user-id'] = decoded.userId;
      }
    } catch (error) {
      // Silent error
    }
  }
  return config;
});

export default api;
