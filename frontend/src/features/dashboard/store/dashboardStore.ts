// src/features-real/dashboard/store/dashboardStore.ts
import { create } from 'zustand';
import { Word } from '../types/word';

interface DashboardState {
  words: Word[];
  filteredWords: Word[];
  selectedWordId: string | null;
  isLoading: boolean;
  error: Error | null;
  filters: {
    search: string;
    expertiseLevel: 'all' | 'new' | 'learning' | 'mastered';
    sortBy: 'lastSeen' | 'expertiseLevel' | 'alphabetical';
    sortDirection: 'asc' | 'desc';
  };
  stats: {
    totalWords: number;
    newWords: number;
    learningWords: number;
    masteredWords: number;
    lastPracticed: Date | null;
    averageExpertise: number;
  };
}

interface DashboardActions {
  setWords: (words: Word[]) => void;
  updateWord: (wordId: string, updates: Partial<Word>) => void;
  deleteWord: (wordId: string) => void;
  setSelectedWord: (wordId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setFilters: (filters: Partial<DashboardState['filters']>) => void;
  applyFilters: () => void;
  updateStats: () => void;
}

const initialState: DashboardState = {
  words: [],
  filteredWords: [],
  selectedWordId: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    expertiseLevel: 'all',
    sortBy: 'lastSeen',
    sortDirection: 'desc',
  },
  stats: {
    totalWords: 0,
    newWords: 0,
    learningWords: 0,
    masteredWords: 0,
    lastPracticed: null,
    averageExpertise: 0,
  },
};

export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
  ...initialState,

  setWords: (words) => {
    set({ words });
    get().applyFilters();
    get().updateStats();
  },

  updateWord: (wordId, updates) => {
    set((state) => ({
      words: state.words.map((word) =>
        word.id === wordId ? { ...word, ...updates } : word
      ),
    }));
    get().applyFilters();
    get().updateStats();
  },

  deleteWord: (wordId) => {
    set((state) => ({
      words: state.words.filter((word) => word.id !== wordId),
      selectedWordId: state.selectedWordId === wordId ? null : state.selectedWordId,
    }));
    get().applyFilters();
    get().updateStats();
  },

  setSelectedWord: (wordId) => set({ selectedWordId: wordId }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { words, filters } = get();
    
    let result = [...words];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (word) =>
          word.original.toLowerCase().includes(searchLower) ||
          word.lemma.toLowerCase().includes(searchLower) ||
          word.translation.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply expertise level filter
    if (filters.expertiseLevel !== 'all') {
      switch (filters.expertiseLevel) {
        case 'new':
          result = result.filter((word) => word.expertiseLevel < 30);
          break;
        case 'learning':
          result = result.filter(
            (word) => word.expertiseLevel >= 30 && word.expertiseLevel < 80
          );
          break;
        case 'mastered':
          result = result.filter((word) => word.expertiseLevel >= 80);
          break;
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const direction = filters.sortDirection === 'asc' ? 1 : -1;
      
      switch (filters.sortBy) {
        case 'lastSeen':
          return direction * (new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
        case 'expertiseLevel':
          return direction * (b.expertiseLevel - a.expertiseLevel);
        case 'alphabetical':
          return direction * a.original.localeCompare(b.original);
        default:
          return 0;
      }
    });
    
    set({ filteredWords: result });
  },

  updateStats: () => {
    const { words } = get();
    
    const newWords = words.filter((word) => word.expertiseLevel < 30).length;
    const learningWords = words.filter(
      (word) => word.expertiseLevel >= 30 && word.expertiseLevel < 80
    ).length;
    const masteredWords = words.filter((word) => word.expertiseLevel >= 80).length;
    
    // Find last practiced date
    let lastPracticed: Date | null = null;
    words.forEach((word) => {
      if (
        word.lastPracticed &&
        (!lastPracticed || new Date(word.lastPracticed) > new Date(lastPracticed))
      ) {
        lastPracticed = new Date(word.lastPracticed);
      }
    });
    
    // Calculate average expertise
    const averageExpertise =
      words.length > 0
        ? words.reduce((sum, word) => sum + word.expertiseLevel, 0) / words.length
        : 0;
    
    set({
      stats: {
        totalWords: words.length,
        newWords,
        learningWords,
        masteredWords,
        lastPracticed,
        averageExpertise,
      },
    });
  },
}));