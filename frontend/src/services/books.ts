/**
 * Book-related services
 */
import axios from 'axios';
import { API_ENDPOINTS, handleApiError } from './api';
import { BookContent, BookMetadata, FeaturedBook, UserBook } from '../types/books';
import { saveToIndexedDB, getFromIndexedDB } from '../utils/indexedDB';

/**
 * Fetch a list of featured books
 */
export async function getFeaturedBooks(): Promise<FeaturedBook[]> {
  try {
    const response = await axios.get(API_ENDPOINTS.BOOKS.FEATURED);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetch books for a specific user
 */
export async function getUserBooks(userId: string): Promise<UserBook[]> {
  try {
    const response = await axios.get(`${API_ENDPOINTS.BOOKS.USER}/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get book content from server or local storage
 */
export async function getBookContent(
  bookId: string, 
  type: 'featured' | 'custom', 
  title?: string
): Promise<BookContent> {
  try {
    // For user uploaded books, check IndexedDB first
    if (type === 'custom') {
      try {
        const content = await getFromIndexedDB(bookId);
        if (content) {
          return content;
        }
      } catch (error) {
        console.warn('Failed to load from IndexedDB, falling back to server:', error);
      }
    }
    
    // Fetch from server
    const response = await axios.get(API_ENDPOINTS.BOOKS.RETRIEVE, {
      params: {
        title: title,
        bookId: bookId,
        type: type
      }
    });
    
    // For custom books, cache in IndexedDB
    if (type === 'custom') {
      try {
        await saveToIndexedDB(bookId, response.data);
      } catch (error) {
        console.warn('Failed to save to IndexedDB:', error);
      }
    }
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Upload a book file
 */
export async function uploadBook(userId: string, file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    const response = await axios.post(
      API_ENDPOINTS.BOOKS.UPLOAD, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data.id;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Update reading progress for a book
 */
export async function updateBookProgress(
  userId: string, 
  bookId: string, 
  progress: { lastPosition: number }
): Promise<void> {
  try {
    await axios.post(API_ENDPOINTS.BOOKS.PROGRESS, {
      userId,
      bookId,
      position: progress.lastPosition,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Save book metadata to Firestore
 */
export async function saveBookMetadata(
  userId: string,
  metadata: Partial<BookMetadata>
): Promise<string> {
  try {
    const response = await axios.post(`${API_ENDPOINTS.BOOKS.USER}/${userId}`, metadata);
    return response.data.id;
  } catch (error) {
    throw handleApiError(error);
  }
}