/**
 * IndexedDB utility for offline storage
 */
import { BookContent } from '../types/books';

const DB_NAME = 'linguality_db';
const DB_VERSION = 1;
const BOOK_STORE = 'books';
const CHAPTER_STORE = 'chapters';

/**
 * Initialize IndexedDB
 */
export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      console.log('IndexedDB opened successfully');
      resolve();
    };
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create book store if it doesn't exist
      if (!db.objectStoreNames.contains(BOOK_STORE)) {
        db.createObjectStore(BOOK_STORE);
        console.log('Book store created');
      }
      
      // Create chapter store if needed for future EPUB support
      if (!db.objectStoreNames.contains(CHAPTER_STORE)) {
        const chapterStore = db.createObjectStore(CHAPTER_STORE);
        console.log('Chapter store created');
      }
    };
  });
}

/**
 * Open database connection
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Save book content to IndexedDB
 */
export async function saveToIndexedDB(
  id: string, 
  content: BookContent
): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BOOK_STORE], 'readwrite');
    const store = transaction.objectStore(BOOK_STORE);
    
    const request = store.put(content, id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get book content from IndexedDB
 */
export async function getFromIndexedDB(id: string): Promise<BookContent> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BOOK_STORE], 'readonly');
    const store = transaction.objectStore(BOOK_STORE);
    
    const request = store.get(id);
    
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        reject(new Error(`Book ${id} not found in IndexedDB`));
      }
    };
    
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete book from IndexedDB
 */
export async function deleteFromIndexedDB(id: string): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BOOK_STORE], 'readwrite');
    const store = transaction.objectStore(BOOK_STORE);
    
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Check if a book exists in IndexedDB
 */
export async function bookExistsInIndexedDB(id: string): Promise<boolean> {
  try {
    const book = await getFromIndexedDB(id);
    return Boolean(book);
  } catch (error) {
    return false;
  }
}

/**
 * Save chapter content (for future EPUB support)
 */
export async function saveChapterToIndexedDB(
  bookId: string,
  chapterId: string,
  content: any
): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAPTER_STORE], 'readwrite');
    const store = transaction.objectStore(CHAPTER_STORE);
    
    const key = `${bookId}_${chapterId}`;
    const request = store.put(content, key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get chapter content (for future EPUB support)
 */
export async function getChapterFromIndexedDB(
  bookId: string,
  chapterId: string
): Promise<any> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAPTER_STORE], 'readonly');
    const store = transaction.objectStore(CHAPTER_STORE);
    
    const key = `${bookId}_${chapterId}`;
    const request = store.get(key);
    
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        reject(new Error(`Chapter ${chapterId} not found for book ${bookId}`));
      }
    };
    
    request.onerror = () => reject(request.error);
  });
}