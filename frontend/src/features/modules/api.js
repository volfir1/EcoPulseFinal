import axios from 'axios';

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',  // Make sure this matches your Django server
  timeout: 30000, // Increase timeout to 30 seconds
  withCredentials: false, // Required for CORS when using credentials
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor to handle tokens if needed
api.interceptors.request.use(
  (config) => {
    // You can add authorization headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - the server took too long to respond');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - please check if the Django server is running at http://127.0.0.1:8000');
    } else {
      console.error('API Error:', error.message || 'Unknown error');
    }
    
    return Promise.reject(error);
  }
);

export default api;