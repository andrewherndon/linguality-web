// src/features-real/library/store/libraryStore.ts
import { create } from 'zustand';
import type { Book } from '../services/bookService';

interface SortOption {
  field: 'title' | 'uploadDate' | 'lastRead';
  direction: 'asc' | 'desc';
}

interface LibraryState {
  books: Book[];
  isLoading: boolean;
  error: Error | null;
  filters: {
    search: string;
    language: string | null;
    format: 'txt' | 'epub' | null;
  };
  sort: SortOption;
  selectedBookId: string | null;
}

interface LibraryActions {
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBook: (bookId: string, updates: Partial<Book>) => void;
  deleteBook: (bookId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setFilters: (filters: Partial<LibraryState['filters']>) => void;
  setSort: (sort: SortOption) => void;
  setSelectedBook: (bookId: string | null) => void;
}

const initialState: LibraryState = {
  books: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    language: null,
    format: null,
  },
  sort: {
    field: 'uploadDate',
    direction: 'desc',
  },
  selectedBookId: null,
};

export const useLibraryStore = create<LibraryState & LibraryActions>((set) => ({
  ...initialState,

  setBooks: (books) => set({ books }),

  addBook: (book) => 
    set((state) => ({
      books: [book, ...state.books],
    })),

  updateBook: (bookId, updates) =>
    set((state) => ({
      books: state.books.map((book) =>
        book.id === bookId ? { ...book, ...updates } : book
      ),
    })),

  deleteBook: (bookId) =>
    set((state) => ({
      books: state.books.filter((book) => book.id !== bookId),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSort: (sort) => set({ sort }),

  setSelectedBook: (bookId) => set({ selectedBookId: bookId }),
}));