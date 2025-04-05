import { create } from 'zustand';
import { 
  ReaderState, 
  ReaderSettings, 
  ReadingPosition, 
  BookContent,
  Chapter 
} from '../types/reader';

// Initial reader settings
const initialSettings: ReaderSettings = {
  mode: 'word',
  orientation: 'horizontal',
  fontSize: 16,
  lineHeight: 1.5,
  margin: 16,
  showTranslation: false
};

// Initial reading position
const initialPosition: ReadingPosition = { 
  wordIndex: 0, 
  percentage: 0 
};

interface ReaderActions {
  setSettings: (settings: Partial<ReaderSettings>) => void;
  setPosition: (position: ReadingPosition) => void;
  setContent: (content: BookContent) => void;
  setChapter: (chapter: Chapter) => void;
  setChapters: (chapters: Chapter[]) => void;
  saveWord: (word: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

// Create the reader store with Zustand
export const useReaderStore = create<ReaderState & ReaderActions>((set) => ({
  // Initial state
  settings: initialSettings,
  position: initialPosition,
  content: null,
  currentChapter: null,
  chapters: [],
  savedWords: new Set(),
  isLoading: false,
  error: null,

  // Actions
  setSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  setPosition: (position) => 
    set((state) => ({
      position,
      content: state.content ? {
        ...state.content,
        currentWord: state.content.words[position.wordIndex]
      } : null
    })),

  setContent: (content) =>
    set({ content }),

  setChapter: (chapter) =>
    set({ currentChapter: chapter }),

  setChapters: (chapters) =>
    set({ chapters }),

  saveWord: (word) =>
    set((state) => ({
      savedWords: new Set([...state.savedWords, word]),
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error }),
}));