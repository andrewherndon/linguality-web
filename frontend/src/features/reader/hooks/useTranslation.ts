import { useState, useCallback } from 'react';
import { translateWord } from '@/services/translation';
import { saveWord } from '@/services/words';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { TranslationState } from '../types/reader';

export function useTranslation() {
  // Initial state
  const [translation, setTranslation] = useState<TranslationState>({
    selectedWord: '',
    text: '',
    isRevealed: false,
    isSaved: false,
    selectedIndex: -1,
    x: 0,
    y: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Handle word click to reveal translation
  const handleWordClick = useCallback(async (
    word: string, 
    index: number = -1,
    event?: React.MouseEvent
  ) => {
    setIsLoading(true);
    setTranslation({
      selectedWord: word,
      text: '',
      isRevealed: true,
      isSaved: false,
      selectedIndex: index,
      x: event ? event.clientX : 0,
      y: event ? event.clientY : 0
    });
    
    try {
      // Get translation
      const translatedText = await translateWord(word);
      
      // Update state with translation
      setTranslation(prev => ({
        ...prev,
        text: translatedText
      }));
      
      return true;
    } catch (error) {
      console.error('Translation error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle saving a word
  const handleSaveWord = useCallback(async (
    word?: string,
    context?: string,
    bookId?: string,
    position?: number
  ) => {
    if (!user) return false;
    
    // Default to current translation if parameters not provided
    const wordToSave = word || translation.selectedWord;
    const positionToSave = position !== undefined ? position : translation.selectedIndex;
    
    if (!wordToSave || positionToSave === -1) return false;
    
    try {
      setIsLoading(true);
      
      await saveWord(user.id, {
        word: wordToSave,
        context: context || wordToSave,
        bookId: bookId || 'unknown',
        position: positionToSave
      });
      
      setTranslation(prev => ({
        ...prev,
        isSaved: true
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving word:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, translation]);

  // Handle showing definition without saving
  const handleRevealDefinition = useCallback(async (
    word: string
  ) => {
    try {
      setIsLoading(true);
      const translatedText = await translateWord(word);
      
      setTranslation({
        selectedWord: word,
        text: translatedText,
        isRevealed: true,
        isSaved: false,
        selectedIndex: -1,
        x: 0, 
        y: 0
      });
      
      return true;
    } catch (error) {
      console.error('Translation error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset translation state
  const resetTranslation = useCallback(() => {
    setTranslation({
      selectedWord: '',
      text: '',
      isRevealed: false,
      isSaved: false,
      selectedIndex: -1,
      x: 0,
      y: 0
    });
  }, []);

  // Close translation popup
  const handleClose = useCallback(() => {
    resetTranslation();
  }, [resetTranslation]);

  return {
    translation,
    isLoading,
    hoveredWord: translation.selectedWord ? {
      word: translation.selectedWord,
      position: { x: translation.x, y: translation.y }
    } : null,
    showTranslation: translation.isRevealed,
    currentTranslation: translation.text,
    hasSavedWord: translation.isSaved,
    handleWordClick,
    handleSaveWord,
    handleRevealDefinition,
    handleClose,
    resetTranslation
  };
}