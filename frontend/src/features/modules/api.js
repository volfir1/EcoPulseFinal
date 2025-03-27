import axios from 'axios';

// Determine the base URL based on environment with better fallbacks
const getBaseUrl = () => {
  // First try environment variable
  const envUrl = import.meta.env.VITE_PY_URL;
  if (envUrl) {
    console.log('Using environment variable VITE_PY_URL:', envUrl);
    return envUrl;
  }
  
  // Default to production URL
  console.log('Using default production URL');
  return 'https://ecopulsebackend-production.up.railway.app';
};

const baseURL = getBaseUrl();

// Log configuration for debugging
console.log(`API Configuration:`);
console.log(`- Environment: ${process.env.NODE_ENV || 'unknown'}`);
console.log(`- Base URL: ${baseURL}`);

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor to handle tokens and logging
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if using JWT authentication
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log outgoing requests in development
    console.log(`🚀 Request: ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ Response: ${response.status} ${response.config.url}`);
    
    // Handle token refresh if your API returns a new token
    if (response.data && response.data.newToken) {
      localStorage.setItem('token', response.data.newToken);
    }
    
    return response;
  },
  (error) => {
    // Detailed error logging
    if (error.code === 'ECONNABORTED') {
      console.error(`⏱️ Request timeout - the server at ${baseURL} took too long to respond`);
    } else if (error.code === 'ERR_NETWORK') {
      console.error(`🔌 Network error - cannot connect to the backend at ${baseURL}`);
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`🚨 Server error: ${error.response.status}`, error.response.data);
      
      if (error.response.status === 401) {
        console.error('Authentication error - you may need to log in again');
      } else if (error.response.status === 404) {
        console.error('Resource not found - check your endpoint path');
      } else if (error.response.status === 403) {
        console.error('Permission denied - you may not have access to this resource');
      } else if (error.response.status === 500) {
        console.error('Server error - please try again later or contact support');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message || 'Unknown error');
    }
    
    return Promise.reject(error);
  }
);

// Add a method to test the connection to the backend
api.testConnection = async () => {
  try {
    console.log(`Testing connection to ${baseURL}...`);
    const response = await api.get('/api/health');
    console.log('Connection test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error };
  }
};

console.log(`API configured to use backend at: ${baseURL}`);

export default api;