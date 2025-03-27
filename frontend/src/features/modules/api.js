import axios from 'axios';

// Determine the base URL based on environment
const baseURL = import.meta.env.VITE_PY_URL || 'https://ecopulsebackend-production.up.railway.app';  // Use local backend as default

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: baseURL,  // Use environment variable for Railway backend
  timeout: 30000, // Increase timeout to 30 seconds
  withCredentials: true, // Required for CORS when using credentials (cookies)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor to handle tokens if needed
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if using JWT authentication
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Handle token refresh if your API returns a new token
    if (response.data && response.data.newToken) {
      localStorage.setItem('token', response.data.newToken);
    }
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - the server took too long to respond');
    } else if (error.code === 'ERR_NETWORK') {
      console.error(`Network error - cannot connect to the backend at ${baseURL}`);
    } else if (error.response && error.response.status === 401) {
      console.error('Authentication error - you may need to log in again');
      // Optional: Redirect to login page or clear tokens
      // localStorage.removeItem('token');
    } else {
      console.error('API Error:', error.message || 'Unknown error');
    }
    
    return Promise.reject(error);
  }
);

console.log(`API configured to use backend at: ${baseURL}`);

export default api;
