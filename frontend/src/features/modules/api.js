import axios from 'axios';

// Determine the base URLs for each backend
const NODE_BACKEND_URL = import.meta.env.VITE_API_URL|| 'https://ecopulsebackend-production.up.railway.app';
const DJANGO_BACKEND_URL = import.meta.env.VITE_PY_URL || 'https://your-django-backend-url.railway.app'; // Update this

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: DJANGO_BACKEND_URL,  // Default to Django backend for prediction APIs
  timeout: 30000, // Increase timeout to 30 seconds
  withCredentials: true, // Required for CORS when using credentials
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Also create a Node.js backend API instance
const nodeApi = axios.create({
  baseURL: NODE_BACKEND_URL,
  timeout: 30000,
  withCredentials: true,
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
      console.error(`Network error - cannot connect to the backend at ${error.config?.baseURL || 'unknown'}`);
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

// Apply the same interceptors to nodeApi
nodeApi.interceptors.request.use(
  api.interceptors.request.handlers[0].fulfilled,
  api.interceptors.request.handlers[0].rejected
);

nodeApi.interceptors.response.use(
  api.interceptors.response.handlers[0].fulfilled,
  api.interceptors.response.handlers[0].rejected
);

console.log(`Django API configured to use backend at: ${DJANGO_BACKEND_URL}`);
console.log(`Node.js API configured to use backend at: ${NODE_BACKEND_URL}`);

// Export the main API instance as default for backward compatibility
export default api;

// Also export the Node.js API instance for specific Node.js backend calls
export { nodeApi };