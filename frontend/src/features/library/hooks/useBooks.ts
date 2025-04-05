// src/features-real/library/hooks/useBooks.ts
import { useCallback, useEffect, useMemo } from 'react';
import { useLibraryStore } from '../store/libraryStore';
import { bookService, type Book } from '../services/bookService';
import { useAuth } from '@/context/AuthContext';

export const useBooks = () => {
  const { user } = useAuth();
  const {
    books,
    isLoading,
    error,
    filters,
    sort,
    selectedBookId,
    setBooks,
    setLoading,
    setError,
    addBook,
    updateBook: updateBookStore,
    deleteBook: deleteBookStore,
  } = useLibraryStore();

  // Load books on mount
  useEffect(() => {
    const loadBooks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userBooks = await bookService.getUserBooks(user.id);
        setBooks(userBooks);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to load books'));
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [user]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    return books
      .filter(book => {
        const matchesSearch = !filters.search || 
          book.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          book.author?.toLowerCase().includes(filters.search.toLowerCase());
          
        const matchesLanguage = !filters.language || 
          book.language === filters.language;
          
        const matchesFormat = !filters.format || 
          book.format === filters.format;

        return matchesSearch && matchesLanguage && matchesFormat;
      })
      .sort((a, b) => {
        const direction = sort.direction === 'asc' ? 1 : -1;
        
        switch (sort.field) {
          case 'title':
            return direction * a.title.localeCompare(b.title);
          case 'lastRead':
            const aDate = a.lastRead || new Date(0);
            const bDate = b.lastRead || new Date(0);
            return direction * (bDate.getTime() - aDate.getTime());
          case 'uploadDate':
          default:
            return direction * (b.uploadDate.getTime() - a.uploadDate.getTime());
        }
      });
  }, [books, filters, sort]);

  const handleUpload = useCallback(async (file: File) => {
    if (!user) return;

    try {
      setLoading(true);
      const bookId = await bookService.uploadBook(user.id, file);
      const newBooks = await bookService.getUserBooks(user.id);
      setBooks(newBooks);
      return bookId;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to upload book'));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateBook = useCallback(async (bookId: string, updates: Partial<Book>) => {
    if (!user) return;

    try {
      await bookService.updateBook(user.id, bookId, updates);
      updateBookStore(bookId, updates);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to update book'));
      throw error;
    }
  }, [user]);

  const deleteBook = useCallback(async (bookId: string) => {
    if (!user) return;

    try {
      await bookService.deleteBook(user.id, bookId);
      deleteBookStore(bookId);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to delete book'));
      throw error;
    }
  }, [user]);

  const updateReadingProgress = useCallback(async (
    bookId: string, 
    position: number
  ) => {
    if (!user) return;

    try {
      await bookService.updateReadingProgress(user.id, bookId, position);
      updateBookStore(bookId, { lastPosition: position, lastRead: new Date() });
    } catch (error) {
      console.error('Error updating reading progress:', error);
      // Don't throw - non-critical error
    }
  }, [user]);

  return {
    books: filteredBooks,
    selectedBook: books.find(b => b.id === selectedBookId),
    isLoading,
    error,
    handleUpload,
    updateBook,
    deleteBook,
    updateReadingProgress
  };
};