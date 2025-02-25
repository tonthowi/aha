/**
 * Utilities for handling Google authentication
 */

import { GoogleAuthProvider, signInWithRedirect, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { supportsPopups } from './authUtils';

// Safe browser environment detection
const isBrowser = typeof window !== 'undefined';

// Safe sessionStorage operations
const safeSessionStorage = {
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.error(`[Auth] Error setting sessionStorage for key ${key}:`, e);
    }
  },
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.error(`[Auth] Error accessing sessionStorage for key ${key}:`, e);
      return null;
    }
  }
};

// Safe localStorage operations
const safeLocalStorage = {
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`[Auth] Error setting localStorage for key ${key}:`, e);
    }
  }
};

// Safe URL update
const safeUpdateUrl = (): void => {
  if (!isBrowser) return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url.toString());
  } catch (e) {
    console.error('[Auth] Error updating URL:', e);
  }
};

/**
 * Sign in with Google with special handling for debug errors
 */
export const signInWithGoogleSafely = async () => {
  if (!isBrowser) {
    console.error('[Auth] Cannot sign in server-side');
    throw new Error('Authentication must be performed on the client side');
  }

  try {
    console.log('[Auth] Starting Google sign-in with safe mode');
    const provider = new GoogleAuthProvider();
    
    // Add scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    // Set custom parameters for better compatibility
    provider.setCustomParameters({
      prompt: 'select_account',
      // Don't use cookie_policy as it might be causing issues
      // cookie_policy: 'none'
    });

    // Clear any existing errors from the URL before redirecting
    safeUpdateUrl();
    
    // Store a flag to indicate we're using the safe mode
    safeSessionStorage.setItem('usingSafeGoogleAuth', 'true');
    safeSessionStorage.setItem('signInAttempt', 'true');
    safeSessionStorage.setItem('signInTimestamp', Date.now().toString());
    
    // Add a global debug function to the window before redirecting
    // Make sure debug is defined globally
    if (!window.hasOwnProperty('debug')) {
      (window as any).debug = function(...args: any[]) {
        console.log('[Debug]', ...args);
      };
    }
    
    // Also add it to localStorage to try to persist it across domains
    safeLocalStorage.setItem('debugFunctionDefined', 'true');
    
    // Check if we can use popups (better UX) or need to use redirect
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const canUsePopups = supportsPopups();
    
    if (isMobile || !canUsePopups) {
      // Use redirect for mobile devices or when popups are not supported
      console.log(`[Auth] Using redirect due to: ${isMobile ? 'mobile device' : 'popup not supported'}`);
      await signInWithRedirect(auth, provider);
    } else {
      // Try popup for desktop when supported
      console.log('[Auth] Attempting popup authentication');
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('[Auth] Popup authentication successful', result.user.email);
        return result;
      } catch (popupError: any) {
        // Check for specific popup errors
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user') {
          console.warn(`[Auth] Popup issue: ${popupError.code}, falling back to redirect`);
        } else {
          console.error('[Auth] Popup authentication error:', popupError);
        }
        
        // Fall back to redirect method
        await signInWithRedirect(auth, provider);
      }
    }
    
    console.log('[Auth] Redirect initiated');
  } catch (error: any) {
    console.error('[Auth] Error signing in with Google:', error);
    
    // Add more context to the error for better debugging
    if (error.code) {
      console.error(`[Auth] Error code: ${error.code}`);
    }
    
    // Clear the sign-in flags if there's an error
    if (isBrowser) {
      try {
        sessionStorage.removeItem('usingSafeGoogleAuth');
        sessionStorage.removeItem('signInAttempt');
        sessionStorage.removeItem('signInTimestamp');
      } catch (e) {
        console.error('[Auth] Error clearing session storage after auth error:', e);
      }
    }
    
    throw error;
  }
};

/**
 * Check if we need to handle debug errors
 */
export const checkForDebugErrors = () => {
  if (!isBrowser) return;
  
  try {
    // Check if we're coming back from Google auth
    const isReturningFromAuth = window.location.href.includes('firebase') && 
                             window.location.href.includes('auth/handler');
    
    if (isReturningFromAuth) {
      console.log('[Auth] Returning from Google authentication');
      
      // Make sure debug is defined
      if (!window.hasOwnProperty('debug')) {
        (window as any).debug = function(...args: any[]) {
          console.log('[Debug]', ...args);
        };
        console.log('[Auth] Added debug function after returning from auth');
      }
    }
  } catch (e) {
    console.error('[Auth] Error in checkForDebugErrors:', e);
  }
};

// Run the check immediately if in browser
if (isBrowser) {
  checkForDebugErrors();
} 