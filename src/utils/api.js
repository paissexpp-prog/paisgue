// ================================================================
// 📄 FILE PATH: src/utils/api.js
// ================================================================

import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: 'https://api.ruangotp.site/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// ================================================================
// REQUEST INTERCEPTOR
// Tambah token & x-user-id ke setiap request
// ================================================================
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

// ================================================================
// RESPONSE INTERCEPTOR
// Kalau backend return 401 (token invalid / akun tidak ada)
// → otomatis clear localStorage dan redirect ke /login
// ================================================================
api.interceptors.response.use(
  (response) => response, // Response normal, langsung teruskan
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
