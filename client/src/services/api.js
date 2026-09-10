/**
 * Central API Client & Authentication Helper Service
 * Simplifies HTTP requests, token management, and role-based helpers
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Authentication & Session Helper Functions
export const authService = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },
  setUser: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    if (token) localStorage.setItem('token', token);
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
  getRole: () => {
    const user = authService.getUser();
    return user ? user.role : null;
  }
};

export default api;
