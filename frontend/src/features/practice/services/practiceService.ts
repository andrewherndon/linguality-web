// src/features-real/practice/services/practiceService.ts
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePracticeStore } from '../store/practiceStore';

export interface PracticeWord {
  id: string;
  original: string;
  translation: string;
  expertiseLevel: number;
  lastPracticed?: Date;
}

export interface PracticeResult {
  wordId: string;
  correct: boolean;
  attemptCount: number;
  timeSpent: number;
  mistakes?: string[];
}

export interface GameConfig {
  wordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  gameType: 'spelling' | 'translation' | 'matching';
  timeLimit?: number;
}

/**
 * Fetch words for practice based on game configuration and user preferences
 */
export async function fetchPracticeWords(
  userId: string, 
  config: GameConfig
): Promise<PracticeWord[]> {
  try {
    const { wordCount, difficulty } = config;
    
    // Determine expertise level range based on difficulty
    let minExpertise = 0;
    let maxExpertise = 100;
    
    switch (difficulty) {
      case 'easy':
        minExpertise = 50;
        maxExpertise = 100;
        break;
      case 'medium':
        minExpertise = 20;
        maxExpertise = 70;
        break;
      case 'hard':
        minExpertise = 0;
        maxExpertise = 40;
        break;
    }
    
    // Create query to fetch appropriate words
    const wordsRef = collection(db, `users/${userId}/words`);
    const q = query(
      wordsRef,
      where('expertiseLevel', '>=', minExpertise),
      where('expertiseLevel', '<=', maxExpertise),
      orderBy('lastPracticed', 'asc'),
      limit(wordCount)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // If no words found in the specified range, fetch any available words
      const fallbackQuery = query(
        wordsRef,
        orderBy('lastPracticed', 'asc'),
        limit(wordCount)
      );
      
      const fallbackSnapshot = await getDocs(fallbackQuery);
      return fallbackSnapshot.docs.map(doc => ({
        id: doc.id,
        original: doc.data().original,
        translation: doc.data().translation,
        expertiseLevel: doc.data().expertiseLevel || 0,
        lastPracticed: doc.data().lastPracticed?.toDate()
      }));
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      original: doc.data().original,
      translation: doc.data().translation,
      expertiseLevel: doc.data().expertiseLevel || 0,
      lastPracticed: doc.data().lastPracticed?.toDate()
    }));
  } catch (error) {
    console.error('Error fetching practice words:', error);
    throw error;
  }
}

/**
 * Save practice game results to update word expertise and track progress
 */
export async function savePracticeResults(
  userId: string,
  results: PracticeResult[],
  gameType: string
): Promise<void> {
  try {
    // For each word, update its expertise level based on the result
    const batch = db.batch();
    
    results.forEach(result => {
      const wordRef = doc(db, `users/${userId}/words/${result.wordId}`);
      
      // Adjust expertise level based on correctness
      const expertiseChange = result.correct ? 5 : -2;
      
      batch.update(wordRef, {
        expertiseLevel: increment(expertiseChange),
        lastPracticed: serverTimestamp(),
        [`practiceHistory.${gameType}`]: arrayUnion({
          timestamp: serverTimestamp(),
          correct: result.correct,
          timeSpent: result.timeSpent,
          mistakes: result.mistakes || []
        })
      });
    });
    
    // Also save an overall practice session record
    const practiceSessionRef = doc(collection(db, `users/${userId}/practiceSessions`));
    batch.set(practiceSessionRef, {
      timestamp: serverTimestamp(),
      gameType,
      wordCount: results.length,
      correctCount: results.filter(r => r.correct).length,
      totalTime: results.reduce((total, r) => total + r.timeSpent, 0),
      averageTimePerWord: results.reduce((total, r) => total + r.timeSpent, 0) / results.length
    });
    
    await batch.commit();
    
    // Update the local practice store with the latest results
    const { updateLastSession } = usePracticeStore.getState();
    updateLastSession({
      timestamp: new Date(),
      gameType,
      wordCount: results.length,
      correctCount: results.filter(r => r.correct).length,
      totalTime: results.reduce((total, r) => total + r.timeSpent, 0)
    });
  } catch (error) {
    console.error('Error saving practice results:', error);
    throw error;
  }
}

/**
 * Get practice session history for the user
 */
export async function getPracticeHistory(userId: string, limit = 10): Promise<any[]> {
  try {
    const sessionsRef = collection(db, `users/${userId}/practiceSessions`);
    const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(limit));
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (error) {
    console.error('Error fetching practice history:', error);
    throw error;
  }
}