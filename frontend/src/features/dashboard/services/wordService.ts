// src/features-real/dashboard/services/wordService.ts
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Word } from '../types/word';

export const wordService = {
  // Get all words for a user
  async getUserWords(userId: string): Promise<Word[]> {
    try {
      const wordsRef = collection(db, `users/${userId}/words`);
      const snapshot = await getDocs(wordsRef);
      
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Transform Firestore timestamps to Date objects
        const lastSeen = data.lastSeen?.toDate() || new Date();
        const lastPracticed = data.lastPracticed?.toDate();
        const contexts = data.contexts?.map((ctx: any) => ({
          ...ctx,
          timestamp: ctx.timestamp?.toDate() || new Date(),
        }));
        
        return {
          id: doc.id,
          original: data.original || data.word || '',
          lemma: data.lemma || '',
          translation: data.translation || '',
          partOfSpeech: data.partOfSpeech || '',
          expertiseLevel: data.expertiseLevel || 0,
          timesEncountered: data.timesEncountered || 1,
          lastSeen,
          lastPracticed,
          successfulRecalls: data.successfulRecalls || 0,
          mistakeCount: data.mistakeCount || 0,
          contexts: contexts || [],
          tags: data.tags || [],
          notes: data.notes || '',
        };
      });
    } catch (error) {
      console.error('Error fetching user words:', error);
      throw error;
    }
  },

  // Update a word
  async updateWord(userId: string, wordId: string, updates: Partial<Word>): Promise<void> {
    try {
      const wordRef = doc(db, `users/${userId}/words/${wordId}`);
      await updateDoc(wordRef, updates);
    } catch (error) {
      console.error('Error updating word:', error);
      throw error;
    }
  },

  // Delete a word
  async deleteWord(userId: string, wordId: string): Promise<void> {
    try {
      const wordRef = doc(db, `users/${userId}/words/${wordId}`);
      await deleteDoc(wordRef);
    } catch (error) {
      console.error('Error deleting word:', error);
      throw error;
    }
  },

  // Reset word progress
  async resetWordProgress(userId: string, wordId: string): Promise<void> {
    try {
      const wordRef = doc(db, `users/${userId}/words/${wordId}`);
      await updateDoc(wordRef, {
        expertiseLevel: 0,
        successfulRecalls: 0,
        mistakeCount: 0,
      });
    } catch (error) {
      console.error('Error resetting word progress:', error);
      throw error;
    }
  },

  // Get words by expertise level
  async getWordsByExpertiseLevel(
    userId: string,
    minLevel: number,
    maxLevel: number
  ): Promise<Word[]> {
    try {
      const wordsRef = collection(db, `users/${userId}/words`);
      const q = query(
        wordsRef,
        where('expertiseLevel', '>=', minLevel),
        where('expertiseLevel', '<=', maxLevel)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        
        return {
          id: doc.id,
          original: data.original || data.word || '',
          lemma: data.lemma || '',
          translation: data.translation || '',
          partOfSpeech: data.partOfSpeech || '',
          expertiseLevel: data.expertiseLevel || 0,
          timesEncountered: data.timesEncountered || 1,
          lastSeen: data.lastSeen?.toDate() || new Date(),
          lastPracticed: data.lastPracticed?.toDate(),
          successfulRecalls: data.successfulRecalls || 0,
          mistakeCount: data.mistakeCount || 0,
          contexts: data.contexts?.map((ctx: any) => ({
            ...ctx,
            timestamp: ctx.timestamp?.toDate() || new Date(),
          })) || [],
          tags: data.tags || [],
          notes: data.notes || '',
        };
      });
    } catch (error) {
      console.error('Error fetching words by expertise level:', error);
      throw error;
    }
  },
};