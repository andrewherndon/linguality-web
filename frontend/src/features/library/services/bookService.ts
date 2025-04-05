// src/features-real/library/services/bookService.ts
import { API_ENDPOINTS } from '@/config/api';
import { getFromIndexedDB } from '@/utils/indexedDB';
import { processEpubUpload, EpubProcessor } from '@/utils/epub-utils';
import { FeaturedBook, UserBook, BookContent } from '../types/books';

class BookService {
  private featuredBooksCache: FeaturedBook[] | null = null;

  async getFeaturedBooks(): Promise<FeaturedBook[]> {
    try {
      // Return cached data if available
      if (this.featuredBooksCache) {
        return this.featuredBooksCache;
      }

      const response = await fetch(`${API_ENDPOINTS.FEATURED_BOOKS}`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured books');
      }

      const books = await response.json();
      this.featuredBooksCache = books;
      return books;
    } catch (error) {
      console.error('Error fetching featured books:', error);
      throw error;
    }
  }
  async getBookContent(
    bookId: string, 
    type: 'featured' | 'custom', 
    title?: string
  ): Promise<BookContent> {
    try {
      if (type === 'featured') {
        const response = await fetch(
          `${API_ENDPOINTS.RETRIEVE_BOOK}?title=${encodeURIComponent(title || '')}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch book content');
        }

        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/epub+zip')) {
          const arrayBuffer = await response.arrayBuffer();
          const processor = new EpubProcessor(arrayBuffer);
          await processor.initialize();

          // Get both metadata and first chapter content
          const metadata = await processor.getMetadata();
          const firstChapter = metadata.chapters[0];
          const chapterContent = await processor.processChapter(firstChapter);

          return {
            text: chapterContent.content,
            htmlContent: chapterContent.htmlContent,
            words: chapterContent.words,
            metadata: {
              title: metadata.title,
              author: metadata.creator,
              language: metadata.language,
              chapters: metadata.chapters
            }
          };
        } else {
          const text = await response.text();
          return {
            text,
            words: text.split(/\s+/).filter(word => word.length > 0)
          };
        }
      } else {
        // Get user-uploaded book from IndexedDB
        return await getFromIndexedDB(bookId);
      }
    } catch (error) {
      console.error('Error fetching book content:', error);
      throw error;
    }
  }

  async getChapterContent(
    bookId: string,
    chapterId: string
  ): Promise<BookContent> {
    try {
      const content = await getFromIndexedDB(bookId);
      if (!content) {
        throw new Error(`Book ${bookId} not found`);
      }

      // If we have specific chapter content stored, return that
      if (content.metadata?.chapters) {
        const chapter = content.metadata.chapters.find(ch => ch.id === chapterId);
        if (!chapter) {
          throw new Error(`Chapter ${chapterId} not found`);
        }
        
        // Return chapter-specific content if available
        return {
          ...content,
          currentChapter: chapterId
        };
      }

      return content;
    } catch (error) {
      console.error('Error fetching chapter content:', error);
      throw error;
    }
  }

  async getFeaturedBookById(id: string): Promise<FeaturedBook | null> {
    try {
      const books = await this.getFeaturedBooks();
      return books.find(book => book.id === id) || null;
    } catch (error) {
      console.error('Error fetching featured book:', error);
      throw error;
    }
  }

  // Method for future library search implementation
  async searchBooks(
    query: string,
    filters?: {
      language?: string;
      author?: string;
      genre?: string;
    }
  ): Promise<FeaturedBook[]> {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        ...(filters?.language && { language: filters.language }),
        ...(filters?.author && { author: filters.author }),
        ...(filters?.genre && { genre: filters.genre })
      });

      const response = await fetch(
        `${API_ENDPOINTS.SEARCH_BOOKS}?${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Failed to search books');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  // Clear cache if needed (e.g., after certain time period or manually)
  clearCache() {
    this.featuredBooksCache = null;
  }
}

// Export singleton instance
export const bookService = new BookService();