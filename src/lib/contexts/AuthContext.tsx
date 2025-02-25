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
  signInWithPopup,
  AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { clearAuthSessionStorage, detectAuthRedirectLoop, logAuthState, resetRedirectCount } from '@/lib/utils/authUtils';
import { signInWithGoogleSafely } from '@/lib/utils/googleAuthUtils';

// Safe browser environment detection
const isBrowser = typeof window !== 'undefined';

// Custom logger to replace any potential debug calls
const logger = {
  log: (...args: any[]) => console.log('[Auth]', ...args),
  error: (...args: any[]) => console.error('[Auth]', ...args),
  warn: (...args: any[]) => console.warn('[Auth]', ...args),
  info: (...args: any[]) => console.info('[Auth]', ...args),
};

// Add to window for debugging only in browser environment
if (isBrowser) {
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

// Function to check if an error is a Firebase AuthError
function isFirebaseAuthError(error: any): error is AuthError {
  return error !== null && 
         typeof error === 'object' && 
         'code' in error && 
         typeof error.code === 'string' &&
         error.code.startsWith('auth/');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  // Set up persistence on mount - only in browser
  useEffect(() => {
    if (!isBrowser) return;

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

  // Handle redirect result on component mount - only in browser
  useEffect(() => {
    if (!isBrowser) {
      setLoading(false);
      setIsCheckingRedirect(false);
      return;
    }

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
          clearAuthSessionStorage();
        } else {
          logger.log('No redirect result found');
          
          // Check if we already have a user from auth state
          const currentUser = auth.currentUser;
          if (currentUser) {
            logger.log('User already signed in', currentUser.email);
            setUser(currentUser);
            
            // Clear any sign-in flags since we're already signed in
            clearAuthSessionStorage();
          }
        }
      } catch (error: any) {
        logger.error('Error processing redirect result:', error);
        setAuthError(error);
        
        // Add the error to the URL so the AuthButton can display it
        if (typeof window !== 'undefined') {
          try {
            const url = new URL(window.location.href);
            const errorMessage = error instanceof Error ? error.message : 'auth_error';
            url.searchParams.set('error', errorMessage);
            window.history.replaceState({}, '', url.toString());
          } catch (urlError) {
            logger.error('Error updating URL with auth error:', urlError);
          }
          
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

  // Listen for auth state changes - only in browser
  useEffect(() => {
    // Only set up the listener if we're in a browser and done checking redirect
    if (!isBrowser || isCheckingRedirect) {
      return;
    }

    logger.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (loading) setLoading(false);
      
      // If user is signed in, clear any sign-in flags
      if (currentUser) {
        clearAuthSessionStorage();
      }
      
      // Log the current auth state for debugging
      logAuthState(currentUser, loading);
    }, (error) => {
      logger.error('Auth state change error:', error);
      setAuthError(error);
    });

    return () => unsubscribe();
  }, [loading, isCheckingRedirect]);

  // Try direct popup sign-in first, then fall back to safe method if needed
  const signInWithGoogle = async () => {
    try {
      logger.log('Starting Google sign-in');
      
      // Check if we're on mobile
      const isMobile = isBrowser && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
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
          clearAuthSessionStorage();
        } catch (popupError: any) {
          logger.warn('Popup authentication failed, falling back to safe method', popupError);
          
          // Check for specific popup errors
          if (popupError.code === 'auth/popup-blocked') {
            throw new Error('Pop-up was blocked by your browser. Please allow pop-ups for this site or try a different sign-in method.');
          } else if (popupError.code === 'auth/popup-closed-by-user') {
            throw new Error('The sign-in popup was closed. Please try again to complete the sign-in process.');
          }
          
          // Fall back to the safe method for other errors
          await signInWithGoogleSafely();
        }
      }
    } catch (error: any) {
      logger.error('Error signing in with Google:', error);
      
      // Format user-friendly error message
      let errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      
      // Handle specific auth errors
      if (error.code) {
        switch (error.code) {
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'An account already exists with the same email address but different sign-in method. Please sign in using the original method.';
            break;
          case 'auth/cancelled-popup-request':
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in was cancelled. Please try again.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups for this site or try a different sign-in method.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
        }
      }
      
      // Only set authError if it's a Firebase AuthError
      if (isFirebaseAuthError(error)) {
        setAuthError(error);
      }
      
      clearAuthSessionStorage();
      throw new Error(errorMessage);
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
      if (isBrowser) {
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
