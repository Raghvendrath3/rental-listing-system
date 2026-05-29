import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';
import type { ErrorResponse } from '@/types';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds auth token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles 401 globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    // Handle 401 globally - clear auth and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        // Only redirect if not already on login/register pages
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Check if error is a specific HTTP status
 */
export function isHttpError(error: unknown, status: number): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === status;
  }
  return false;
}

export default api;
