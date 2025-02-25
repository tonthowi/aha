/**
 * Authentication utilities to help with debugging and managing auth state
 */

import { User } from 'firebase/auth';

// Safe browser environment detection
const isBrowser = typeof window !== 'undefined';

// Function to safely access sessionStorage
const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.error(`[Auth] Error accessing sessionStorage for key ${key}:`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.error(`[Auth] Error setting sessionStorage for key ${key}:`, e);
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.error(`[Auth] Error removing sessionStorage for key ${key}:`, e);
    }
  },
  length: (): number => {
    if (!isBrowser) return 0;
    try {
      return sessionStorage.length;
    } catch (e) {
      console.error(`[Auth] Error accessing sessionStorage length:`, e);
      return 0;
    }
  },
  key: (index: number): string | null => {
    if (!isBrowser) return null;
    try {
      return sessionStorage.key(index);
    } catch (e) {
      console.error(`[Auth] Error accessing sessionStorage key at index ${index}:`, e);
      return null;
    }
  }
};

// Function to safely update URL
const safeUpdateUrl = (callback: (url: URL) => void): void => {
  if (!isBrowser) return;
  try {
    const url = new URL(window.location.href);
    callback(url);
    window.history.replaceState({}, '', url.toString());
  } catch (e) {
    console.error('[Auth] Error updating URL:', e);
  }
};

// Function to clear all auth-related session storage
export const clearAuthSessionStorage = () => {
  if (!isBrowser) return;
  
  try {
    // Clear standard auth session items
    const authItems = [
      'signInAttempt',
      'signInTimestamp',
      'authRedirectCount',
      'usingSafeGoogleAuth',
      'lastRedirectTime'
    ];
    
    authItems.forEach(item => safeSessionStorage.removeItem(item));
    
    // Clear Firebase auth related items
    const keysToRemove: string[] = [];
    
    // Find all Firebase auth related items
    for (let i = 0; i < safeSessionStorage.length(); i++) {
      const key = safeSessionStorage.key(i);
      if (key && (key.startsWith('firebase:') || key.includes('firebaseui'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove them
    keysToRemove.forEach(key => {
      safeSessionStorage.removeItem(key);
    });
    
    console.log('[Auth] Cleared auth session storage');
    
    // Also try to clear any problematic cookies
    if (isBrowser && document.cookie) {
      try {
        document.cookie.split(';').forEach(function(c) {
          if (c.trim().startsWith('firebaseAuth') || c.trim().startsWith('firebase')) {
            document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
          }
        });
      } catch (e) {
        console.warn('[Auth] Error clearing cookies:', e);
      }
    }
  } catch (e) {
    console.error('[Auth] Error in clearAuthSessionStorage:', e);
  }
};

// Function to log auth state for debugging
export const logAuthState = (user: User | null, loading: boolean) => {
  console.log('[Auth] Current state:', {
    isAuthenticated: !!user,
    loading,
    user: user ? {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isAnonymous: user.isAnonymous,
      emailVerified: user.emailVerified,
      providerData: user.providerData,
    } : null,
  });
};

// Function to detect if we're in a redirect loop
export const detectAuthRedirectLoop = (): boolean => {
  if (!isBrowser) return false;
  
  try {
    // Get the current timestamp
    const now = Date.now();
    const lastRedirectTimeStr = safeSessionStorage.getItem('lastRedirectTime');
    const lastRedirectTime = lastRedirectTimeStr ? parseInt(lastRedirectTimeStr, 10) : 0;
    const timeSinceLastRedirect = now - lastRedirectTime;
    
    // If it's been more than 30 seconds since the last redirect, reset the counter
    if (timeSinceLastRedirect > 30000) {
      safeSessionStorage.setItem('authRedirectCount', '0');
    }
    
    // Update the last redirect time
    safeSessionStorage.setItem('lastRedirectTime', now.toString());
    
    // Get and increment the redirect count
    const redirectCountStr = safeSessionStorage.getItem('authRedirectCount');
    const redirectCount = redirectCountStr ? parseInt(redirectCountStr, 10) : 0;
    safeSessionStorage.setItem('authRedirectCount', (redirectCount + 1).toString());
    
    // If we've redirected more than 3 times in a row within 30 seconds, we might be in a loop
    if (redirectCount >= 3) {
      console.error('[Auth] Possible redirect loop detected!');
      // Reset the counter and add an error to the URL
      safeSessionStorage.setItem('authRedirectCount', '0');
      
      // Clear all auth-related session storage to break the loop
      clearAuthSessionStorage();
      
      // Add error to URL
      safeUpdateUrl(url => {
        url.searchParams.set('error', 'redirect_loop_detected');
      });
      
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('[Auth] Error in detectAuthRedirectLoop:', e);
    return false;
  }
};

// Reset redirect count when auth is successful
export const resetRedirectCount = (): void => {
  if (!isBrowser) return;
  
  try {
    safeSessionStorage.setItem('authRedirectCount', '0');
    safeSessionStorage.removeItem('lastRedirectTime');
  } catch (e) {
    console.error('[Auth] Error in resetRedirectCount:', e);
  }
};

// Function to check if the browser supports popups
export const supportsPopups = (): boolean => {
  if (!isBrowser) return false;
  
  try {
    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) return false;
    
    // Check if we're in an iframe (popups often blocked in iframes)
    if (window.self !== window.top) return false;
    
    // Check if popups are blocked
    const popup = window.open('about:blank', '_blank', 'width=1,height=1');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      return false;
    }
    popup.close();
    return true;
  } catch (e) {
    console.warn('[Auth] Error checking popup support:', e);
    return false;
  }
}; 