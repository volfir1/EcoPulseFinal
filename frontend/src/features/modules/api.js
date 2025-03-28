import axios from 'axios';


// Safely get environment variables
const API_URL = 
  (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : undefined) || 
  (import.meta && import.meta.env ? import.meta.env.VITE_API_URL : undefined) || 
  'https://ecopulsebackend-1.onrender.com/api';

const RAILWAY_API_URL = 
  (typeof process !== 'undefined' ? process.env.REACT_APP_RAILWAY_API_URL : undefined) || 
  (import.meta && import.meta.env ? import.meta.env.VITE_RAILWAY_API_URL : undefined) || 
  'https://ecopulsebackend.onrender.com';

// Create an instance of axios for the primary API
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/auth
  timeout: 10000, // 10 seconds timeout
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

export { nodeApi, railwayApi };
export default api;