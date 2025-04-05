// src/features-real/dashboard/hooks/useUserWords.ts
import { useState, useEffect, useCallback } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { wordService } from '../services/wordService';
import { statisticsService } from '../services/statisticsService';
import { useAuth } from '@/context/AuthContext';
import { Word } from '../types/word';

export const useUserWords = () => {
  const { user } = useAuth();
  const {
    words,
    filteredWords,
    stats,
    filters,
    selectedWordId,
    isLoading,
    error,
    setWords,
    updateWord: updateStoreWord,
    deleteWord: deleteStoreWord,
    setSelectedWord,
    setLoading,
    setError,
    setFilters,
  } = useDashboardStore();

  const [userStats, setUserStats] = useState(null);

  // Load words on mount
  useEffect(() => {
    const loadWords = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userWords = await wordService.getUserWords(user.id);
        setWords(userWords);

        // Load statistics
        const stats = await statisticsService.getUserStats(user.id);
        setUserStats(stats);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to load words'));
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, [user, setWords, setLoading, setError]);

  // Update a word
  const updateWord = useCallback(
    async (wordId: string, updates: Partial<Word>) => {
      if (!user) return;

      try {
        setLoading(true);
        await wordService.updateWord(user.id, wordId, updates);
        updateStoreWord(wordId, updates);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to update word'));
      } finally {
        setLoading(false);
      }
    },
    [user, updateStoreWord, setLoading, setError]
  );

  // Delete a word
  const deleteWord = useCallback(
    async (wordId: string) => {
      if (!user) return;

      try {
        setLoading(true);
        await wordService.deleteWord(user.id, wordId);
        deleteStoreWord(wordId);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to delete word'));
      } finally {
        setLoading(false);
      }
    },
    [user, deleteStoreWord, setLoading, setError]
  );

  // Reset word progress
  const resetWordProgress = useCallback(
    async (wordId: string) => {
      if (!user) return;

      try {
        setLoading(true);
        await wordService.resetWordProgress(user.id, wordId);
        updateStoreWord(wordId, {
          expertiseLevel: 0,
          successfulRecalls: 0,
          mistakeCount: 0,
        });
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to reset word progress'));
      } finally {
        setLoading(false);
      }
    },
    [user, updateStoreWord, setLoading, setError]
  );

  return {
    words: filteredWords,
    allWords: words,
    selectedWord: words.find((w) => w.id === selectedWordId),
    stats,
    userStats,
    filters,
    isLoading,
    error,
    updateWord,
    deleteWord,
    resetWordProgress,
    setSelectedWord,
    setFilters,
  };
};