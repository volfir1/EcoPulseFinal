import axios from 'axios';

// Get the API URL from env or use fallbacks
const API_URL = process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || 'https://ecopulsebackend-1.onrender.com';
const RAILWAY_API_URL = process.env.REACT_APP_RAILWAY_API_URL || import.meta.env.VITE_RAILWAY_API_URL || 'https://ecopulse.up.railway.app';

// Create an instance of axios for the primary API
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/auth
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create an instance for Node.js backend
const nodeApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create a Railway instance as fallback
const railwayApi = axios.create({
  baseURL: RAILWAY_API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error handling and retry logic for the nodeApi
nodeApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If it's a CORS or network error, try the Railway API as fallback
    if (error.code === 'ERR_NETWORK' || 
        (error.response && error.response.status === 0) ||
        error.message === 'Network Error') {
      
      console.log('Network error with primary API, trying Railway fallback...');
      
      try {
        // Get the original request config
        const originalRequest = error.config;
        
        // Make the same request to Railway API
        const fallbackResponse = await railwayApi(originalRequest);
        console.log('Successfully used Railway API fallback');
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('Railway API fallback also failed:', fallbackError);
        return Promise.reject(error); // Return original error if fallback also fails
      }
    }
    
    return Promise.reject(error);
  }
);
s
export { nodeApi, railwayApi };
export default api;