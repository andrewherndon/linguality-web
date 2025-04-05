import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Word } from '@/features-real/dashboard/types/word';
import { getWordsForPractice } from '../services/practiceService';

export type GameType = 'spelling' | 'matching' | 'multiplechoice';

interface UsePracticeWordsOptions {
  count?: number;
  minExpertise?: number;
  maxExpertise?: number;
  specificIds?: string[];
}

export function usePracticeWords(
  gameType: GameType,
  options: UsePracticeWordsOptions = {}
) {
  const { user } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWords = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Set up default parameters based on game type
        let practiceOptions = { ...options };
        
        if (gameType === 'spelling') {
          // For spelling, prioritize words the user is still learning
          practiceOptions = {
            count: options.count || 10,
            minExpertise: options.minExpertise || 20,
            maxExpertise: options.maxExpertise || 80,
            ...options
          };
        } else if (gameType === 'matching') {
          // For matching, we might want a mix of well-known and learning words
          practiceOptions = {
            count: options.count || 8,
            minExpertise: options.minExpertise || 0,
            maxExpertise: options.maxExpertise || 100,
            ...options
          };
        } else if (gameType === 'multiplechoice') {
          // For multiple choice, similar parameters as matching
          practiceOptions = {
            count: options.count || 10,
            minExpertise: options.minExpertise || 0,
            maxExpertise: options.maxExpertise || 100,
            ...options
          };
        }

        const practiceWords = await getWordsForPractice(user.id, practiceOptions);
        setWords(practiceWords);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch practice words'));
        console.error('Error fetching practice words:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, [user, gameType, options]);

  return { words, isLoading, error };
}