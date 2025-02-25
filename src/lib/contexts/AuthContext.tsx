"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  getRedirectResult,
  browserLocalPersistence,
  setPersistence,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { clearAuthSessionStorage, detectAuthRedirectLoop, logAuthState, resetRedirectCount } from '@/lib/utils/authUtils';
import { signInWithGoogleSafely } from '@/lib/utils/googleAuthUtils';

// Custom logger to replace any potential debug calls
const logger = {
  log: (...args: any[]) => console.log('[Auth]', ...args),
  error: (...args: any[]) => console.error('[Auth]', ...args),
  warn: (...args: any[]) => console.warn('[Auth]', ...args),
  info: (...args: any[]) => console.info('[Auth]', ...args),
};

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).debug = (...args: any[]) => console.log('[Debug]', ...args);
  (window as any).authLogger = logger;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  // Set up persistence on mount
  useEffect(() => {
    const setupPersistence = async () => {
      try {
        // Use local persistence for better compatibility
        await setPersistence(auth, browserLocalPersistence);
        logger.log('Persistence set up successfully');
      } catch (error) {
        logger.error("Error setting persistence:", error);
      }
    };
    
    setupPersistence();
  }, []);

  // Handle redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        // Check if we're in a redirect loop
        if (detectAuthRedirectLoop()) {
          logger.warn('Redirect loop detected, aborting auth check');
          setLoading(false);
          setIsCheckingRedirect(false);
          return;
        }

        logger.log('Checking redirect result');
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          // User successfully signed in after redirect
          logger.log('User signed in after redirect', result.user.email);
          setUser(result.user);
          resetRedirectCount(); // Reset the redirect counter
          
          // Clear the safe auth flag
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('usingSafeGoogleAuth');
            sessionStorage.removeItem('signInAttempt');
            sessionStorage.removeItem('signInTimestamp');
          }
        } else {
          logger.log('No redirect result found');
          
          // Check if we already have a user from auth state
          const currentUser = auth.currentUser;
          if (currentUser) {
            logger.log('User already signed in', currentUser.email);
            setUser(currentUser);
            
            // Clear any sign-in flags since we're already signed in
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('usingSafeGoogleAuth');
              sessionStorage.removeItem('signInAttempt');
              sessionStorage.removeItem('signInTimestamp');
            }
          }
        }
      } catch (error) {
        logger.error('Error processing redirect result:', error);
        // Add the error to the URL so the AuthButton can display it
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('error', error instanceof Error ? error.message : 'auth_error');
          window.history.replaceState({}, '', url.toString());
          
          // Clear any sign-in attempt in session storage
          clearAuthSessionStorage();
        }
      } finally {
        setLoading(false);
        setIsCheckingRedirect(false);
      }
    };

    checkRedirectResult();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    // Only set up the listener if we're done checking redirect
    if (!isCheckingRedirect) {
      logger.log('Setting up auth state listener');
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (loading) setLoading(false);
        
        // If user is signed in, clear any sign-in flags
        if (user && typeof window !== 'undefined') {
          sessionStorage.removeItem('usingSafeGoogleAuth');
          sessionStorage.removeItem('signInAttempt');
          sessionStorage.removeItem('signInTimestamp');
        }
        
        // Log the current auth state for debugging
        logAuthState(user, loading);
      });

      return () => unsubscribe();
    }
  }, [loading, isCheckingRedirect]);

  // Try direct popup sign-in first, then fall back to safe method if needed
  const signInWithGoogle = async () => {
    try {
      logger.log('Starting Google sign-in');
      
      // Check if we're on mobile
      const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Use the safe method for mobile
        logger.log('Using safe method for mobile device');
        await signInWithGoogleSafely();
      } else {
        // Try popup for desktop first
        try {
          logger.log('Attempting direct popup authentication');
          const provider = new GoogleAuthProvider();
          provider.addScope('profile');
          provider.addScope('email');
          
          const result = await signInWithPopup(auth, provider);
          logger.log('Popup authentication successful', result.user.email);
          setUser(result.user);
          
          // Clear any sign-in flags
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('usingSafeGoogleAuth');
            sessionStorage.removeItem('signInAttempt');
            sessionStorage.removeItem('signInTimestamp');
          }
        } catch (popupError) {
          logger.warn('Popup authentication failed, falling back to safe method', popupError);
          // Fall back to the safe method
          await signInWithGoogleSafely();
        }
      }
    } catch (error) {
      logger.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      logger.log('Signing out');
      
      // Clear any auth-related session storage before signing out
      clearAuthSessionStorage();
      
      await firebaseSignOut(auth);
      logger.log('Sign out successful');
      
      // Force refresh the page after sign out to ensure clean state
      if (typeof window !== 'undefined') {
        // Wait a moment before refreshing to allow state updates
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    } catch (error) {
      logger.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
