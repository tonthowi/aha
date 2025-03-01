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
  AuthError,
  signInWithRedirect
} from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { clearAuthSessionStorage, detectAuthRedirectLoop, logAuthState, resetRedirectCount, supportsPopups } from '@/lib/utils/authUtils';

// Safe browser environment detection
const isBrowser = typeof window !== 'undefined';

// Custom logger to replace any potential debug calls
const logger = {
  log: (...args: any[]) => {},
  error: (...args: any[]) => {},
  warn: (...args: any[]) => {},
  info: (...args: any[]) => {},
  debug: (...args: any[]) => {}
};

// Add to window for debugging only in browser environment
if (isBrowser) {
  (window as any).debug = (...args: any[]) => logger.debug(...args);
  (window as any).authLogger = logger;
  (window as any).monitorAuthState = () => {
    const getState = () => ({
      user: auth.currentUser,
      loading: false,
      isCheckingRedirect: false,
      sessionStorage: {
        signInAttempt: sessionStorage.getItem('signInAttempt'),
        signInTimestamp: sessionStorage.getItem('signInTimestamp'),
        authRedirectCount: sessionStorage.getItem('authRedirectCount'),
        lastRedirectTime: sessionStorage.getItem('lastRedirectTime')
      },
      browser: {
        userAgent: navigator.userAgent,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        isInIframe: window.self !== window.top,
        supportsPopups: !(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) && window.self === window.top
      }
    });

    // Auth state monitoring (logs removed for production)
  };
  (window as any).__AUTH_STATE__ = {
    getState: () => ({
      user: auth.currentUser,
      loading: false,
      isCheckingRedirect: false,
      sessionStorage: {
        signInAttempt: sessionStorage.getItem('signInAttempt'),
        signInTimestamp: sessionStorage.getItem('signInTimestamp'),
        authRedirectCount: sessionStorage.getItem('authRedirectCount'),
        lastRedirectTime: sessionStorage.getItem('lastRedirectTime')
      }
    })
  };
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

  // Consolidated redirect result handler
  useEffect(() => {
    if (!isBrowser) return;

    const handleRedirectResult = async () => {
      try {
        logger.debug('Checking redirect result');
        
        // Wait for Firebase to initialize
        await auth.authStateReady();
        
        // Check if we have a pending sign-in attempt
        const hasSignInAttempt = sessionStorage.getItem('signInAttempt') === 'true';
        const signInTimestamp = sessionStorage.getItem('signInTimestamp');
        const authComplete = sessionStorage.getItem('authComplete') === 'true';
        
        logger.info('Processing redirect result', {
          hasSignInAttempt,
          signInTimestamp,
          authComplete,
          currentUser: auth.currentUser?.email || null,
          currentTime: new Date().toISOString()
        });

        // If we have a completed auth flow from the callback page
        if (authComplete) {
          logger.debug('Auth complete flag found, clearing session storage');
          sessionStorage.removeItem('authComplete');
          
          // If we have a user, we're good
          if (auth.currentUser) {
            logger.info('User already authenticated after redirect', {
              email: auth.currentUser.email,
              uid: auth.currentUser.uid
            });
            setUser(auth.currentUser);
            resetRedirectCount();
            clearAuthSessionStorage();
            setLoading(false);
            setIsCheckingRedirect(false);
            return;
          }
        }

        // If we don't have a sign-in attempt, we're not in a redirect flow
        if (!hasSignInAttempt) {
          logger.debug('No sign-in attempt found');
          setLoading(false);
          setIsCheckingRedirect(false);
          return;
        }

        // Check if we're in a redirect loop
        if (detectAuthRedirectLoop()) {
          logger.warn('Redirect loop detected, aborting');
          clearAuthSessionStorage();
          setLoading(false);
          setIsCheckingRedirect(false);
          return;
        }

        // Get the redirect result
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          logger.info('User authenticated via redirect', {
            email: result.user.email,
            uid: result.user.uid,
            provider: result.user.providerData[0]?.providerId
          });
          
          setUser(result.user);
          resetRedirectCount();
          clearAuthSessionStorage();
          setLoading(false);
          setIsCheckingRedirect(false);
        } else {
          logger.warn('No user found in redirect result');
          clearAuthSessionStorage();
          setLoading(false);
          setIsCheckingRedirect(false);
        }
      } catch (error: any) {
        logger.error('Error processing redirect result:', error);
        clearAuthSessionStorage();
        setLoading(false);
        setIsCheckingRedirect(false);
        
        if (error.code === 'auth/invalid-credential') {
          await auth.signOut().catch(e => logger.error('Error signing out:', e));
        }
      }
    };

    handleRedirectResult();
  }, []); // Run once on mount

  // Listen for auth state changes - only in browser
  useEffect(() => {
    if (!isBrowser) return;

    logger.debug('Setting up auth state listener with state', {
      isCheckingRedirect,
      loading,
      currentUser: auth.currentUser?.email || null,
      timestamp: new Date().toISOString()
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      logger.info('Auth state changed', {
        hasUser: !!currentUser,
        email: currentUser?.email,
        uid: currentUser?.uid,
        emailVerified: currentUser?.emailVerified,
        provider: currentUser?.providerData[0]?.providerId,
        timestamp: new Date().toISOString()
      });
      
      // If we get a user from auth state change, update our state
      if (currentUser) {
        logger.info('User authenticated via auth state change', {
          email: currentUser.email,
          uid: currentUser.uid,
          provider: currentUser.providerData[0]?.providerId
        });
        
        setUser(currentUser);
        
        // Clear any pending sign-in attempts since we're now signed in
        logger.debug('Clearing auth session storage after successful sign in');
        clearAuthSessionStorage();
        
        // If we were in a loading state, clear it
        if (loading) {
          logger.debug('Setting loading to false after auth state change');
          setLoading(false);
        }
      } else {
        // No user, update state accordingly
        setUser(null);
        
        // If we were in a loading state, clear it
        if (loading) {
          logger.debug('Setting loading to false after auth state change (no user)');
          setLoading(false);
        }
      }
      
      logAuthState(currentUser, loading);
    }, (error: any) => {
      logger.error('Auth state change error:', error, {
        code: error?.code || 'unknown',
        name: error?.name || 'Error',
        stack: error?.stack || 'No stack trace',
        timestamp: new Date().toISOString()
      });
      
      if (isFirebaseAuthError(error)) {
        setAuthError(error);
      } else {
        setAuthError(null);
      }
      
      // Ensure we're not stuck in loading state
      if (loading) {
        setLoading(false);
      }
    });

    return () => {
      logger.debug('Cleaning up auth state listener', {
        timestamp: new Date().toISOString(),
        hadUser: !!auth.currentUser
      });
      unsubscribe();
    };
  }, [loading, isCheckingRedirect]);

  // Improved Google sign-in implementation with better popup handling
  const signInWithGoogle = async () => {
    try {
      logger.info('Starting Google sign-in');
      
      // Clear any previous state
      clearAuthSessionStorage();
      setAuthError(null);
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ 
        prompt: 'select_account',
        include_granted_scopes: 'true',
        access_type: 'offline'
      });
      
      // Set auth persistence to local to maintain the session
      await setPersistence(auth, browserLocalPersistence);
      
      // Check if we're on localhost
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
      
      // For localhost, try popup first
      if (isLocalhost && supportsPopups()) {
        try {
          logger.info('Attempting popup sign-in on localhost');
          const result = await signInWithPopup(auth, provider);
          
          if (result?.user) {
            logger.info('User signed in successfully with popup', {
              email: result.user.email,
              uid: result.user.uid
            });
            setUser(result.user);
            setLoading(false);
            return; // Exit early on successful popup sign-in
          }
        } catch (popupError: any) {
          logger.warn('Popup sign-in error:', popupError);
          
          // Fall back to redirect if popup fails
          if (popupError.code === 'auth/popup-blocked' || 
              popupError.code === 'auth/cancelled-popup-request' ||
              popupError.code === 'auth/popup-closed-by-user') {
            logger.info('Popup was blocked or closed, falling back to redirect');
            // Continue to redirect flow
          } else {
            // For other errors, throw
            setLoading(false);
            throw popupError;
          }
        }
      }
      
      // For production or if popup failed, use redirect
      logger.info('Using redirect sign-in');
      
      // Store that we're attempting a sign-in
      sessionStorage.setItem('signInAttempt', 'true');
      sessionStorage.setItem('signInTimestamp', Date.now().toString());
      
      // Use redirect sign-in
      await signInWithRedirect(auth, provider);
      
      // Note: The code execution won't reach here in the redirect flow
      // as the page will be redirected to Google
      
    } catch (error: any) {
      logger.error('Error in Google sign-in:', error);
      clearAuthSessionStorage();
      setLoading(false);
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
