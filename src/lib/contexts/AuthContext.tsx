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
  log: (...args: any[]) => console.log('[Auth]', ...args, new Date().toISOString()),
  error: (...args: any[]) => console.error('[Auth]', ...args, new Date().toISOString()),
  warn: (...args: any[]) => console.warn('[Auth]', ...args, new Date().toISOString()),
  info: (...args: any[]) => console.info('[Auth]', ...args, new Date().toISOString()),
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Auth Debug]', ...args, new Date().toISOString());
    }
  }
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

    console.group('🔍 Auth State Monitor');
    console.log('Initial State:', getState());
    console.log('🎯 Auth State Monitor Active');
    console.groupEnd();
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

  // Check for existing user on mount
  useEffect(() => {
    if (!isBrowser) return;
    
    const checkInitialAuthState = async () => {
      try {
        logger.debug('Checking initial auth state');
        
        // Wait for Firebase to initialize auth state
        await auth.authStateReady();
        
        const currentUser = auth.currentUser;
        logger.debug('Initial auth state check complete', {
          hasUser: !!currentUser,
          email: currentUser?.email || null,
          timestamp: new Date().toISOString()
        });
        
        if (currentUser) {
          logger.info('User already authenticated on mount', {
            email: currentUser.email,
            uid: currentUser.uid,
            provider: currentUser.providerData[0]?.providerId
          });
          setUser(currentUser);
          
          // Clear any stale sign-in attempts
          clearAuthSessionStorage();
          
          // Clear loading state
          setLoading(false);
        } else {
          // Check if we have a pending redirect
          const hasSignInAttempt = sessionStorage.getItem('signInAttempt') === 'true';
          if (hasSignInAttempt) {
            // We have a sign-in attempt, check for redirect result immediately
            logger.debug('Sign-in attempt found, checking redirect result immediately');
            try {
              const result = await getRedirectResult(auth);
              if (result?.user) {
                logger.info('User found in immediate redirect result check', {
                  email: result.user.email,
                  uid: result.user.uid
                });
                setUser(result.user);
                clearAuthSessionStorage();
                setLoading(false);
              } else {
                logger.debug('No user found in immediate redirect result check');
                // Let the redirect handler manage loading state
              }
            } catch (redirectError) {
              logger.error('Error in immediate redirect result check:', redirectError);
              // Let the redirect handler manage loading state
            }
          } else {
            // No user and no pending redirect, we're done loading
            setLoading(false);
          }
        }
      } catch (error) {
        logger.error('Error checking initial auth state:', error);
        setLoading(false);
      }
    };
    
    checkInitialAuthState();
  }, []);

  // Set up persistence on mount - only in browser
  useEffect(() => {
    if (!isBrowser) return;

    const setupPersistence = async () => {
      try {
        logger.info('Setting up persistence...', { type: 'browserLocalPersistence' });
        await setPersistence(auth, browserLocalPersistence);
        logger.info('Persistence set up successfully');
      } catch (error) {
        logger.error("Error setting persistence:", error);
      }
    };
    
    setupPersistence();
  }, []);

  // Handle redirect result on component mount - only in browser
  useEffect(() => {
    if (!isBrowser) {
      logger.debug('Skipping redirect check - not in browser');
      setLoading(false);
      setIsCheckingRedirect(false);
      return;
    }

    logger.debug('Initializing redirect check effect', {
      hasAuthObject: !!auth,
      currentUser: auth.currentUser?.email || null,
      isLoading: loading,
      isCheckingRedirect,
      timestamp: new Date().toISOString()
    });

    const checkRedirectResult = async () => {
      try {
        // Log initial state
        logger.debug('Starting redirect result check with state', {
          authCurrentUser: auth.currentUser?.email || null,
          authInitialized: auth.currentUser !== undefined,
          loading,
          isCheckingRedirect,
          timestamp: new Date().toISOString()
        });

        // Check if we have a pending sign-in attempt
        const hasSignInAttempt = sessionStorage.getItem('signInAttempt') === 'true';
        const signInTimestamp = sessionStorage.getItem('signInTimestamp');
        
        logger.info('Starting redirect result check', {
          hasSignInAttempt,
          signInTimestamp,
          currentUser: auth.currentUser?.email || null,
          currentTime: new Date().toISOString()
        });
        
        // If we don't have a sign-in attempt, skip the check
        if (!hasSignInAttempt) {
          logger.debug('No sign-in attempt found, skipping redirect check');
          setLoading(false);
          setIsCheckingRedirect(false);
          return;
        }

        // Check if we're in a redirect loop
        if (detectAuthRedirectLoop()) {
          logger.warn('Redirect loop detected, aborting auth check');
          setLoading(false);
          setIsCheckingRedirect(false);
          clearAuthSessionStorage();
          return;
        }

        // Wait for Firebase to initialize fully
        logger.debug('Waiting for Firebase to initialize fully');
        await auth.authStateReady();
        
        // Check if we already have a user after the redirect
        const currentUser = auth.currentUser;
        if (currentUser) {
          logger.info('User already signed in after redirect', {
            email: currentUser.email,
            uid: currentUser.uid,
            provider: currentUser.providerData[0]?.providerId
          });
          setUser(currentUser);
          clearAuthSessionStorage();
          setLoading(false);
          setIsCheckingRedirect(false);
          return;
        }
        
        // Get the redirect result
        logger.debug('Getting redirect result from Firebase');
        
        try {
          // Set up a timeout for getRedirectResult
          const redirectResultPromise = Promise.race([
            getRedirectResult(auth),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error('getRedirectResult timed out after 10s'));
              }, 10000); // 10 second timeout
            })
          ]);

          logger.debug('Awaiting redirect result from Firebase', {
            timestamp: new Date().toISOString()
          });
          
          const result = await redirectResultPromise;
          
          logger.debug('Got redirect result', { 
            hasResult: !!result,
            resultUser: result?.user?.email || null,
            timestamp: new Date().toISOString()
          });
          
          if (result?.user) {
            logger.info('User signed in after redirect', {
              email: result.user.email,
              uid: result.user.uid,
              provider: result.user.providerData[0]?.providerId
            });
            
            // Update the user state
            setUser(result.user);
            resetRedirectCount();
            clearAuthSessionStorage();
            
            // Force a page refresh to ensure clean state
            if (isBrowser) {
              logger.info('Refreshing page to ensure clean state');
              window.location.reload();
              return;
            }
          } else {
            logger.warn('No user found in redirect result');
            
            // Try one more time with a delay
            setTimeout(async () => {
              try {
                logger.debug('Retrying redirect result check');
                const retryResult = await getRedirectResult(auth);
                
                if (retryResult?.user) {
                  logger.info('User found in retry redirect result', {
                    email: retryResult.user.email,
                    uid: retryResult.user.uid
                  });
                  setUser(retryResult.user);
                  clearAuthSessionStorage();
                } else {
                  logger.warn('No user found in retry redirect result');
                  clearAuthSessionStorage();
                }
              } catch (retryError) {
                logger.error('Error in retry redirect result:', retryError);
                clearAuthSessionStorage();
              } finally {
                setLoading(false);
                setIsCheckingRedirect(false);
              }
            }, 2000);
            return;
          }
        } catch (redirectError: any) {
          logger.error('Error getting redirect result:', redirectError, {
            code: redirectError?.code || 'unknown',
            message: redirectError?.message,
            isTimeout: redirectError.message?.includes('timed out'),
            timestamp: new Date().toISOString()
          });
          
          // Check if we have a current user despite the error
          const currentUser = auth.currentUser;
          if (currentUser) {
            logger.info('User found in current state despite redirect error', {
              email: currentUser.email,
              uid: currentUser.uid
            });
            setUser(currentUser);
            clearAuthSessionStorage();
          } else {
            clearAuthSessionStorage();
          }
        }
      } catch (error: any) {
        logger.error('Error processing redirect result:', error, {
          code: error?.code || 'unknown',
          name: error?.name || 'Error',
          message: error?.message,
          stack: error?.stack || 'No stack trace',
          timestamp: new Date().toISOString()
        });
        
        // Handle specific error cases
        if (error.code === 'auth/invalid-credential') {
          logger.warn('Invalid credential error, clearing auth state');
          await auth.signOut().catch(e => logger.error('Error signing out:', e));
          clearAuthSessionStorage();
        }
        
        setAuthError(isFirebaseAuthError(error) ? error : null);
      } finally {
        setLoading(false);
        setIsCheckingRedirect(false);
        logger.info('Finished checking redirect result');
      }
    };

    // Run the check immediately
    checkRedirectResult();

    // Also set up an interval to check for timeout
    const timeoutCheck = setInterval(() => {
      const signInTimestamp = sessionStorage.getItem('signInTimestamp');
      if (signInTimestamp) {
        const elapsed = Date.now() - parseInt(signInTimestamp, 10);
        if (elapsed > 15000) { // 15 seconds timeout
          logger.warn('Sign-in timeout reached, clearing state');
          clearAuthSessionStorage();
          setLoading(false);
          setIsCheckingRedirect(false);
          clearInterval(timeoutCheck);
        }
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(timeoutCheck);
      logger.debug('Cleaning up redirect check effect', {
        timestamp: new Date().toISOString()
      });
    };
  }, []);

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

  // Try the simplest possible Google sign-in implementation
  const signInWithGoogle = async () => {
    try {
      logger.info('Starting simple Google sign-in');
      
      // Clear any previous auth state and errors
      clearAuthSessionStorage();
      setAuthError(null);
      setLoading(true);
      
      // Create a new Google provider with minimum configuration
      const provider = new GoogleAuthProvider();
      
      // Force account selection to avoid silent sign-in issues
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // Sign out first to ensure a clean state
      await auth.signOut();
      
      // Use simple popup sign-in - most direct approach
      logger.info('Using popup sign-in (direct approach)');
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        logger.info('User signed in successfully with popup', {
          email: result.user.email,
          uid: result.user.uid,
          provider: result.user.providerData[0]?.providerId
        });
        
        setUser(result.user);
        clearAuthSessionStorage();
        setLoading(false);
        
        // Force a clean state
        window.location.reload();
      }
    } catch (error: any) {
      logger.error('Error in simple Google sign-in:', error);
      
      // Check for specific error
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        logger.warn('Sign-in popup was closed by user');
      } else if (error.code === 'auth/popup-blocked') {
        logger.warn('Sign-in popup was blocked by browser');
      }
      
      // Clear auth state
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
