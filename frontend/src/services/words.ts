/**
 * Word management service
 */
import axios from 'axios';
import { API_ENDPOINTS, handleApiError } from './api';
import { SavedWord, WordSaveParams, PracticeResult } from '../types/words';

/**
 * Save a word to the user's collection
 */
export async function saveWord(
  userId: string, 
  params: WordSaveParams
): Promise<SavedWord> {
  try {
    const response = await axios.post(API_ENDPOINTS.WORDS.SAVE, {
      userId,
      word: params.word,
      context: params.context,
      bookId: params.bookId,
      position: params.position,
      language: params.language || 'ru',
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get all words for a user
 */
export async function getUserWords(userId: string): Promise<SavedWord[]> {
  try {
    const response = await axios.get(`${API_ENDPOINTS.WORDS.USER_WORDS}/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get words for practice
 */
export async function getWordsForPractice(
  userId: string, 
  count: number = 10, 
  options: {
    minExpertise?: number,
    maxExpertise?: number,
    lastSeenBefore?: Date
  } = {}
): Promise<SavedWord[]> {
  try {
    const response = await axios.get(`${API_ENDPOINTS.WORDS.USER_WORDS}/${userId}/practice`, {
      params: {
        count,
        ...options
      }
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Save practice results
 */
export async function savePracticeResults(
  userId: string,
  results: PracticeResult[]
): Promise<void> {
  try {
    await axios.post(API_ENDPOINTS.WORDS.PRACTICE_RESULT, {
      userId,
      results
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Update a word
 */
export async function updateWord(
  userId: string,
  wordId: string,
  updates: Partial<SavedWord>
): Promise<void> {
  try {
    await axios.patch(`${API_ENDPOINTS.WORDS.USER_WORDS}/${userId}/words/${wordId}`, updates);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Delete a word
 */
export async function deleteWord(
  userId: string,
  wordId: string
): Promise<void> {
  try {
    await axios.delete(`${API_ENDPOINTS.WORDS.USER_WORDS}/${userId}/words/${wordId}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Reset word progress
 */
export async function resetWordProgress(
  userId: string,
  wordId: string
): Promise<void> {
  try {
    await axios.post(`${API_ENDPOINTS.WORDS.USER_WORDS}/${userId}/words/${wordId}/reset`);
  } catch (error) {
    throw handleApiError(error);
  }
}