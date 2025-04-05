// src/features-real/dashboard/types/word.ts
export interface Word {
    id: string;
    original: string;
    lemma: string;
    translation: string;
    partOfSpeech?: string;
    expertiseLevel: number;
    timesEncountered: number;
    lastSeen: Date;
    lastPracticed?: Date;
    successfulRecalls: number;
    mistakeCount: number;
    contexts: Array<{
      text: string;
      bookId: string;
      position: number;
      timestamp: Date;
    }>;
    tags?: string[];
    notes?: string;
  }
  
  export interface WordFilterOptions {
    search?: string;
    expertiseLevel?: 'all' | 'new' | 'learning' | 'mastered';
    sortBy?: 'lastSeen' | 'expertiseLevel' | 'alphabetical';
    sortDirection?: 'asc' | 'desc';
  }
  
  export interface WordService {
    getUserWords: (userId: string) => Promise<Word[]>;
    updateWord: (userId: string, wordId: string, updates: Partial<Word>) => Promise<void>;
    deleteWord: (userId: string, wordId: string) => Promise<void>;
    resetWordProgress: (userId: string, wordId: string) => Promise<void>;
  }