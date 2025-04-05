/**
 * Authentication types
 */

/**
 * User type
 */
export interface User {
    id: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }
  
  /**
   * User settings
   */
  export interface UserSettings {
    theme: 'classic' | 'dark' | 'light';
    readingPreferences: {
      mode: 'word' | 'line';
      fontSize: number;
      orientation?: 'horizontal' | 'vertical';
    };
  }
  
  /**
   * Authentication state
   */
  export interface AuthState {
    user: User | null;
    loading: boolean;
    error: Error | null;
    settings: UserSettings | null;
  }