import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      const primary = localStorage.getItem('token');
      const hold = localStorage.getItem('holdToken');
      const token = primary || hold;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getMe = (config = {}) => api.get('/auth/me', config);
export const logout = () => api.post('/auth/logout');
export const getFacultyStudents = () => api.get('/users/faculty/students');
export const getStudentAttendance = () => api.get('/attendance/student/my-attendance');

export default api;
