import axios from 'axios';

// LEARN: Axios interceptors run before every request/response.
// We use them to:
//   1. Automatically attach JWT to every request header
//   2. Handle 401 globally (redirect to login)
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach token ───────────────────────────────
api.interceptors.request.use((config) => {
  // Read token from localStorage (set on login)
  const token = localStorage.getItem('lms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;