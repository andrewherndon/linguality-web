/**
 * Text processing utilities
 */

/**
 * Split text into words while preserving relevant punctuation
 */
export function splitTextIntoWords(text: string): string[] {
    if (!text) return [];
    
    // Normalize whitespace and trim
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    
    // Split by spaces while keeping relevant punctuation
    const words = normalizedText.split(/\s+/);
    
    // Clean up and filter out empty strings
    return words
      .map(word => word.trim())
      .filter(word => word.length > 0);
  }
  
  /**
   * Extract context surrounding a word in text
   */
  export function extractContext(
    text: string,
    wordIndex: number,
    contextSize: number = 5
  ): string {
    if (!text) return '';
    
    const words = splitTextIntoWords(text);
    
    // Ensure word index is valid
    if (wordIndex < 0 || wordIndex >= words.length) {
      return '';
    }
    
    // Calculate context bounds
    const start = Math.max(0, wordIndex - contextSize);
    const end = Math.min(words.length, wordIndex + contextSize + 1);
    
    // Extract context
    return words.slice(start, end).join(' ');
  }
  
  /**
   * Clean text by removing extra whitespace, normalizing quotes, etc.
   */
  export function cleanText(text: string): string {
    if (!text) return '';
    
    return text
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Normalize quotes
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Remove control characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .trim();
  }
  
  /**
   * Determines language of text (simple heuristic)
   * For more accurate detection, consider using a library
   */
  export function detectLanguage(text: string): string {
    if (!text || text.length < 10) return 'unknown';
    
    // Simple character-based heuristic
    const cyrillicPattern = /[\u0400-\u04FF]/;  // Cyrillic characters
    const hanPattern = /[\u4E00-\u9FFF]/;       // Chinese characters
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/; // Hiragana & Katakana
    
    if (cyrillicPattern.test(text)) return 'ru';
    if (hanPattern.test(text)) return 'zh';
    if (japanesePattern.test(text)) return 'ja';
    
    // Default to English if no other scripts detected
    return 'en';
  }