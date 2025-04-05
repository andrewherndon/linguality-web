/**
 * Word-related types
 */

/**
 * Parameters for saving a word
 */
export interface WordSaveParams {
    word: string;
    context: string;
    bookId: string;
    position: number;
    language?: string;
  }
  
  /**
   * Saved word structure
   */
  export interface SavedWord {
    id: string;
    lemma: string;
    original: string;
    translation: string;
    expertiseLevel: number;
    timesEncountered: number;
    successfulRecalls: number;
    mistakeCount: number;
    language: string;
    partOfSpeech?: string;
    lastSeen: Date;
    nextReviewDate?: Date;
    contexts: WordContext[];
    forms?: WordForm[];
    tags?: string[];
  }
  
  /**
   * Word context
   */
  export interface WordContext {
    text: string;
    bookId: string;
    position: number;
    form_used?: string;
    timestamp: Date;
  }
  
  /**
   * Word form with morphology
   */
  export interface WordForm {
    word: string;
    morphology?: {
      pos?: string;
      case?: string;
      number?: string;
      gender?: string;
      tense?: string;
      aspect?: string;
      [key: string]: any;
    };
  }
  
  /**
   * Practice result
   */
  export interface PracticeResult {
    lemma: string;
    correct: boolean;
    timeSpent: number;
    mistakes?: string[];
    gameType: 'spelling' | 'translation' | 'association';
  }