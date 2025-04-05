// src/features-real/dashboard/services/statisticsService.ts
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserStats {
  wordCounts: {
    total: number;
    new: number;
    learning: number;
    mastered: number;
  };
  practiceStats: {
    totalSessions: number;
    totalTime: number;
    averageAccuracy: number;
    lastPracticed: Date | null;
  };
  progress: {
    wordsLearned7Days: number;
    wordsLearned30Days: number;
    daysStreak: number;
  };
  readingStats: {
    booksStarted: number;
    totalReadingTime: number;
    lastRead: Date | null;
  };
}

export const statisticsService = {
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Get word counts
      const wordsRef = collection(db, `users/${userId}/words`);
      const wordsSnapshot = await getDocs(wordsRef);
      const words = wordsSnapshot.docs.map((doc) => doc.data());

      const newWords = words.filter((word) => word.expertiseLevel < 30).length;
      const learningWords = words.filter(
        (word) => word.expertiseLevel >= 30 && word.expertiseLevel < 80
      ).length;
      const masteredWords = words.filter((word) => word.expertiseLevel >= 80).length;

      // Get practice stats
      const practiceRef = collection(db, `users/${userId}/practice`);
      const practiceQuery = query(
        practiceRef,
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const practiceSnapshot = await getDocs(practiceQuery);
      const practices = practiceSnapshot.docs.map((doc) => doc.data());

      const totalSessions = practices.length;
      const totalTime = practices.reduce((acc, session) => acc + (session.timeSpent || 0), 0);
      const totalAccuracy = practices.reduce(
        (acc, session) => acc + (session.accuracy || 0),
        0
      );
      const averageAccuracy = totalSessions > 0 ? totalAccuracy / totalSessions : 0;
      const lastPracticed = practices.length > 0 ? practices[0].timestamp.toDate() : null;

      // Get reading stats
      const booksRef = collection(db, `users/${userId}/books`);
      const booksSnapshot = await getDocs(booksRef);
      const books = booksSnapshot.docs.map((doc) => doc.data());

      const booksStarted = books.length;
      const totalReadingTime = books.reduce(
        (acc, book) => acc + (book.timeSpent || 0),
        0
      );
      
      // Get last read book
      const lastReadBook = books.reduce(
        (latest, book) => {
          if (!latest || !latest.lastRead) return book;
          if (!book.lastRead) return latest;
          return new Date(book.lastRead) > new Date(latest.lastRead) ? book : latest;
        },
        null
      );

      const lastRead = lastReadBook?.lastRead ? new Date(lastReadBook.lastRead) : null;

      // Get 7-day and 30-day new words count
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const wordsLearned7Days = words.filter(
        (word) => word.lastSeen && new Date(word.lastSeen) >= sevenDaysAgo
      ).length;
      
      const wordsLearned30Days = words.filter(
        (word) => word.lastSeen && new Date(word.lastSeen) >= thirtyDaysAgo
      ).length;

      // Get streak - this is a simplified implementation
      const daysStreak = 0; // Would require more complex logic with daily records

      return {
        wordCounts: {
          total: words.length,
          new: newWords,
          learning: learningWords,
          mastered: masteredWords,
        },
        practiceStats: {
          totalSessions,
          totalTime,
          averageAccuracy,
          lastPracticed,
        },
        progress: {
          wordsLearned7Days,
          wordsLearned30Days,
          daysStreak,
        },
        readingStats: {
          booksStarted,
          totalReadingTime,
          lastRead,
        },
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  },
};