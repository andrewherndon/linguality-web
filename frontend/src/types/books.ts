/**
 * Book-related types
 */

/**
 * Book content structure
 */
export interface BookContent {
    text: string;
    htmlContent?: string;
    words: string[];
    metadata?: {
      title?: string;
      author?: string;
      language?: string;
      chapters?: Chapter[];
    };
    currentChapter?: string;
  }
  
  /**
   * Book metadata
   */
  export interface BookMetadata {
    id?: string;
    title: string;
    author?: string;
    uploadDate: Date;
    language: string;
    type: 'featured' | 'custom';
    format: 'txt' | 'epub';
    lastPosition?: number;
    lastRead?: Date;
    timeSpent?: number;
  }
  
  /**
   * User's book
   */
  export interface UserBook extends BookMetadata {
    userId: string;
  }
  
  /**
   * Featured book
   */
  export interface FeaturedBook {
    id: string;
    title: string;
    author?: string;
    type: 'featured';
    format: 'txt' | 'epub';
    language: string;
    cover?: string;
  }
  
  /**
   * Chapter structure
   */
  export interface Chapter {
    id: string;
    title: string;
    index: number;
    href?: string;
    level?: number;
    parent?: string;
    subitems?: string[];
    prev?: string | null;
    next?: string | null;
  }
  
  /**
   * Chapter content
   */
  export interface ChapterContent {
    id: string;
    title: string;
    content: string;
    htmlContent?: string;
    words: string[];
    index: number;
    prev: string | null;
    next: string | null;
  }