import React, { createContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, UserSettings } from '@/types/auth';
import { authService } from '@/features/auth/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  settings: UserSettings | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      try {
        if (firebaseUser) {
          // Transform Firebase user to app user
          const appUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          };
          
          setUser(appUser);
          
          // Get user settings
          const userSettings = await authService.getUserSettings(appUser.id);
          setSettings(userSettings);
        } else {
          setUser(null);
          setSettings(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError(err instanceof Error ? err : new Error('Authentication error'));
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create or update user in database
      await authService.createOrUpdateUser(result.user);
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err instanceof Error ? err : new Error('Google sign-in failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
      setError(err instanceof Error ? err : new Error('Sign-out failed'));
      throw err;
    }
  };

  // Update user settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    
    try {
      // Update settings in database
      await authService.updateUserSettings(user.id, newSettings);
      
      // Update local state
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
    } catch (err) {
      console.error('Settings update error:', err);
      setError(err instanceof Error ? err : new Error('Settings update failed'));
      throw err;
    }
  };

  // Context value
  const value = {
    user,
    isLoading,
    error,
    settings,
    signInWithGoogle,
    signOut,
    updateSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}