/**
 * API configuration for the application
 */

// Base API URL - adjust based on environment
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000'  // Development server
  : 'https://api.linguality.com';  // Production server (replace with your actual domain)

// API endpoints
export const API_ENDPOINTS = {
  // Book endpoints
  BOOKS: {
    FEATURED: `${API_BASE_URL}/api/books/featured`,
    USER: `${API_BASE_URL}/api/books/user`,
    RETRIEVE: `${API_BASE_URL}/api/retrieve`,
    UPLOAD: `${API_BASE_URL}/api/books/upload`,
    PROGRESS: `${API_BASE_URL}/api/books/progress`,
  },
  
  // Word endpoints
  WORDS: {
    SAVE: `${API_BASE_URL}/api/save-word`,
    USER_WORDS: `${API_BASE_URL}/api/words`,
    PRACTICE_RESULT: `${API_BASE_URL}/api/practice-result`,
  },
  
  // Translation endpoint
  TRANSLATE: `${API_BASE_URL}/api/translate`,
  
  // Authentication endpoints (if needed)
  AUTH: {
    TEST: `${API_BASE_URL}/api/test/firebase`,
  }
};

// Common headers for API requests
export const API_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper function for handling API errors
export function handleApiError(error: any): Error {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with a non-2xx status
    const message = error.response.data?.error || 'An error occurred';
    return new Error(message);
  } else if (error.request) {
    // Request made but no response received
    return new Error('No response from server. Please check your internet connection.');
  } else {
    // Something else happened
    return new Error(error.message || 'An unknown error occurred');
  }
}