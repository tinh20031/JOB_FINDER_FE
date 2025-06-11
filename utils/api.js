import axios from 'axios';

// Create axios instance with custom config
const api = axios.create({
  // Disable SSL verification in development
  httpsAgent: new (require('https').Agent)({
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  })
});

// Add request interceptor to handle common headers
api.interceptors.request.use(
  (config) => {
    // Add any common headers here
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'EPROTO') {
      console.error('SSL/TLS Protocol Error:', error.message);
      // You might want to show a user-friendly error message here
    }
    return Promise.reject(error);
  }
);

export default api; 