import { useState, useEffect, useCallback } from 'react';
import { useReaderStore } from '../store/readerStore';
import { getBookContent, updateBookProgress } from '@/services/books';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Chapter } from '../types/reader';

interface UseReaderOptions {
  bookId: string;
  bookType: 'featured' | 'custom';
  bookTitle?: string;
  initialWord?: number;
  initialChapter?: string;
}

export function useReader({ 
  bookId, 
  bookType, 
  bookTitle, 
  initialWord = 0,
  initialChapter
}: UseReaderOptions) {
  const {
    settings,
    position,
    content,
    currentChapter,
    chapters,
    setContent,
    setPosition,
    setLoading,
    setError,
    setChapter,
    setChapters
  } = useReaderStore();

  const { user } = useAuth();
  const [progressSaveTimer, setProgressSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Load book content
  useEffect(() => {
    const loadBook = async () => {
      if (!bookId && !bookTitle) {
        setError(new Error('No book specified'));
        return;
      }
      
      try {
        setLoading(true);
        
        // Get book content from API
        const bookContent = await getBookContent(bookId, bookType, bookTitle);
        setContent(bookContent);
        
        // Set chapters if available
        if (bookContent.metadata?.chapters) {
          setChapters(bookContent.metadata.chapters);
          
          // Set initial chapter if chapters are available
          const firstChapter = bookContent.metadata.chapters[0];
          if (firstChapter) {
            setChapter(firstChapter);
          }
        }
        
        // Set initial position
        setPosition({ 
          wordIndex: initialWord, 
          percentage: (initialWord / bookContent.words.length) * 100 
        });
        
        setError(null);
      } catch (error) {
        console.error('Error loading book:', error);
        setError(error instanceof Error ? error : new Error('Failed to load book'));
      } finally {
        setLoading(false);
      }
    };
    
    loadBook();
  }, [
    bookId, 
    bookTitle, 
    bookType, 
    initialWord, 
    setContent, 
    setPosition, 
    setLoading, 
    setError, 
    setChapter, 
    setChapters
  ]);

  // Track reading progress
  useEffect(() => {
    if (!content?.words.length || !user || !bookId) return;
    
    // Clear existing timer
    if (progressSaveTimer) {
      clearTimeout(progressSaveTimer);
    }
    
    // Set a new timer to save progress
    const timer = setTimeout(async () => {
      try {
        // Calculate progress
        const progress = position.wordIndex / content.words.length;
        
        // Save progress to Firebase
        await updateBookProgress(user.id, bookId, {
          lastPosition: progress
        });
      } catch (error) {
        console.error('Error saving reading progress:', error);
      }
    }, 3000); // Save after 3 seconds of no movement
    
    setProgressSaveTimer(timer);
    
    // Clean up timer on unmount
    return () => {
      if (progressSaveTimer) {
        clearTimeout(progressSaveTimer);
      }
    };
  }, [content?.words.length, position.wordIndex, user, bookId, progressSaveTimer]);

  // Navigation functions
  const navigation = {
    next: useCallback(() => {
      if (!content?.words.length) return;
      
      const newIndex = Math.min(position.wordIndex + 1, content.words.length - 1);
      
      // If we're at the end of the content and have chapters, go to next chapter
      if (newIndex === position.wordIndex && currentChapter?.next) {
        // Get next chapter
        const nextChapter = chapters.find(ch => ch.id === currentChapter.next);
        
        if (nextChapter) {
          // Set new chapter
          setChapter(nextChapter);
          
          // Reset position
          setPosition({
            wordIndex: 0,
            percentage: 0,
            chapterId: nextChapter.id
          });
          
          return;
        }
      }
      
      // Otherwise just move to next word
      setPosition({
        wordIndex: newIndex,
        percentage: (newIndex / content.words.length) * 100
      });
    }, [content, position.wordIndex, currentChapter, chapters, setChapter, setPosition]),
    
    previous: useCallback(() => {
      if (!content?.words.length) return;
      
      const newIndex = Math.max(position.wordIndex - 1, 0);
      
      // If we're at the beginning and have a previous chapter, go there
      if (newIndex === 0 && position.wordIndex === 0 && currentChapter?.prev) {
        // Get previous chapter
        const prevChapter = chapters.find(ch => ch.id === currentChapter.prev);
        
        if (prevChapter) {
          // Set new chapter
          setChapter(prevChapter);
          
          // TODO: This would ideally load the chapter content first
          // For now, just go to position 0
          setPosition({
            wordIndex: 0,
            percentage: 0,
            chapterId: prevChapter.id
          });
          
          return;
        }
      }
      
      // Otherwise just move to previous word
      setPosition({
        wordIndex: newIndex,
        percentage: (newIndex / content.words.length) * 100
      });
    }, [content, position.wordIndex, currentChapter, chapters, setChapter, setPosition]),
    
    jumpTo: useCallback((index: number) => {
      if (!content?.words.length) return;
      
      const validIndex = Math.max(0, Math.min(index, content.words.length - 1));
      
      setPosition({
        wordIndex: validIndex,
        percentage: (validIndex / content.words.length) * 100
      });
    }, [content, setPosition]),
    
    goToChapter: useCallback((chapter: Chapter) => {
      // This would ideally load the chapter content
      // For now, just set the chapter and reset position
      setChapter(chapter);
      setPosition({
        wordIndex: 0,
        percentage: 0,
        chapterId: chapter.id
      });
    }, [setChapter, setPosition])
  };

  return {
    content,
    position,
    settings,
    currentChapter,
    chapters,
    navigation,
    isLoading: useReaderStore(state => state.isLoading),
    error: useReaderStore(state => state.error)
  };
}