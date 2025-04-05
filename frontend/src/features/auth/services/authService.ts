import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { UserSettings } from '@/types/auth';

/**
 * Authentication service functions
 */
export const authService = {
  /**
   * Create or update user in Firestore
   */
  async createOrUpdateUser(firebaseUser: FirebaseUser): Promise<void> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    // Basic user data
    const userData = {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      lastLogin: new Date().toISOString(),
    };

    if (!userDoc.exists()) {
      // Additional data for new users
      const newUserData = {
        ...userData,
        createdAt: new Date().toISOString(),
        settings: {
          theme: 'classic',
          readingPreferences: {
            mode: 'word',
            fontSize: 16,
            orientation: 'horizontal'
          }
        }
      };
      
      await setDoc(userRef, newUserData);
    } else {
      // Only update basic info for existing users
      await updateDoc(userRef, userData);
    }
  },

  /**
   * Get user settings from Firestore
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userData = userDoc.data();
    
    // Return settings or default settings if none exist
    return userData.settings || {
      theme: 'classic',
      readingPreferences: {
        mode: 'word',
        fontSize: 16,
        orientation: 'horizontal'
      }
    };
  },

  /**
   * Update user settings in Firestore
   */
  async updateUserSettings(
    userId: string, 
    settings: Partial<UserSettings>
  ): Promise<void> {
    const userRef = doc(db, 'users', userId);
    
    // Get current settings first
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userData = userDoc.data();
    const currentSettings = userData.settings || {};
    
    // Merge settings
    const updatedSettings = {
      ...currentSettings,
      ...settings,
      // Deeply merge readingPreferences if it exists in both
      readingPreferences: {
        ...(currentSettings.readingPreferences || {}),
        ...(settings.readingPreferences || {})
      }
    };
    
    // Update in Firestore
    await updateDoc(userRef, { settings: updatedSettings });
  }
};