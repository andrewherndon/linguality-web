/**
 * Translation service
 */
import axios from 'axios';
import { API_ENDPOINTS, handleApiError } from './api';

export interface TranslationResponse {
  translate: [string, { translatedText: string }];
}

/**
 * Translate a word to the target language
 * @param word The word to translate
 * @param sourceLanguage Optional source language code (auto-detected if not provided)
 * @param targetLanguage Optional target language code (defaults to English)
 */
export async function translateWord(
  word: string,
  sourceLanguage?: string,
  targetLanguage: string = 'en'
): Promise<string> {
  try {
    const response = await axios.get<TranslationResponse>(API_ENDPOINTS.TRANSLATE, {
      params: { 
        word,
        source: sourceLanguage,
        target: targetLanguage
      }
    });
    
    return response.data.translate[1].translatedText;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Cache for translated words to reduce API calls
 */
const translationCache: Record<string, string> = {};

/**
 * Translate a word with caching
 */
export async function translateWordCached(
  word: string,
  sourceLanguage?: string,
  targetLanguage: string = 'en'
): Promise<string> {
  // Create a cache key
  const cacheKey = `${word}_${sourceLanguage || 'auto'}_${targetLanguage}`;
  
  // Check cache first
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }
  
  // Fetch and cache translation
  const translation = await translateWord(word, sourceLanguage, targetLanguage);
  translationCache[cacheKey] = translation;
  
  return translation;
}