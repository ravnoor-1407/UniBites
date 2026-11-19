import axios from 'axios';
import { API_BASE } from '../config/api';

// Base API instance
const API = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer Token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('unibite_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle common auth responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      if (window.location.pathname !== '/') {
        // Can optionally clear token
      }
    }
    return Promise.reject(error);
  }
);

export default API;
