import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

// Create an Axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Get token from local storage or wherever it's stored
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      // Handle specific status codes
      if (status === 401) {
        // Handle unauthorized access
        toast.error('Session expired. Please log in again.');
        // Redirect to login or refresh token
        window.location.href = '/login';
      } else if (status === 403) {
        // Handle forbidden access
        toast.error('You do not have permission to perform this action.');
      } else if (status === 404) {
        // Handle not found
        toast.error('The requested resource was not found.');
      } else if (status >= 500) {
        // Handle server errors
        toast.error('A server error occurred. Please try again later.');
      } else {
        // Handle other errors
        const errorMessage = (data as any)?.message || 'An error occurred';
        toast.error(errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export { api };
