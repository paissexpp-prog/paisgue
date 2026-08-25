import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: 'https://api.ruangotp.net/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const sessionStart = localStorage.getItem('session_start');

  if (token) {
    // Cek Expired Sesi 2 Hari (48 Jam = 172.800.000 ms) sebelum menembak API
    if (sessionStart) {
      const isExpired = Date.now() - parseInt(sessionStart, 10) > 172800000;
      if (isExpired) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(new Error("Sesi login telah habis (48 Jam). Silakan login kembali."));
      }
    } else {
      // Jika token ada tapi waktu belum tercatat, catat sekarang
      localStorage.setItem('session_start', Date.now().toString());
    }

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // MAINTENANCE
    const isServerDown = status === 502 || status === 503 || status === 504;
    if (isServerDown) {
      if (window.location.pathname !== '/maintenance') {
        const originPath = window.location.pathname + window.location.search;
        localStorage.setItem('maintenance_origin', originPath);
        window.location.href = '/maintenance';
      }
      return Promise.reject(error);
    }

    // AKUN TIDAK DITEMUKAN (DIHAPUS WORKER)
    if (status === 403) {
      const message = error.response?.data?.error?.message || '';
      if (message.includes('User tidak ditemukan')) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // TOKEN INVALID / AKUN TIDAK ADA
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
