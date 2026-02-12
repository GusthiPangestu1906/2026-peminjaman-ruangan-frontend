import axios from 'axios';

const API_BASE_URL = 'http://localhost:5215';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Important for CORS
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('[API] Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[API] Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API] No response received:', error.request);
    } else {
      console.error('[API] Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;