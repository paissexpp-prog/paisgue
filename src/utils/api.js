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
  // Tambahkan timeout agar tidak hang selamanya (15 detik)
  timeout: 15000, 
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
// ================================================================
api.interceptors.response.use(
  (response) => response, // Response normal, langsung teruskan
  (error) => {
    // 1. Abaikan error jika request sengaja dibatalkan oleh sistem
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // 2. KONDISI MUTLAK MAINTENANCE:
    // HANYA jika server backend benar-benar membalas dengan status 502, 503, atau 504
    const isServerDown = status === 502 || status === 503 || status === 504;
    
    if (isServerDown) {
      // Pastikan kita belum berada di halaman maintenance agar tidak redirect loop
      if (window.location.pathname !== '/maintenance') {
        const originPath = window.location.pathname + window.location.search;
        localStorage.setItem('maintenance_origin', originPath);
        window.location.href = '/maintenance';
      }
      return Promise.reject(error);
    }

    // 3. Jika akun dihapus worker (404) / token invalid (401)
    if (
      status === 401 ||
      (status === 404 && requestUrl.includes('/auth/me'))
    ) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;

