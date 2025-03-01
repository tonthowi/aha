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
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      // Error handling without console logs
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      // Error handling without console logs
    }
  },
  length: (): number => {
    if (!isBrowser) return 0;
    try {
      return sessionStorage.length;
    } catch (e) {
      return 0;
    }
  },
  key: (index: number): string | null => {
    if (!isBrowser) return null;
    try {
      return sessionStorage.key(index);
    } catch (e) {
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
    // Error handling without console logs
  }
};

// Function to clear all auth-related session storage and cookies
export const clearAuthSessionStorage = () => {
  if (!isBrowser) return;
  
  try {
    // Clear standard auth session items
    const authItems = [
      'signInAttempt',
      'signInTimestamp',
      'authRedirectCount',
      'usingSafeGoogleAuth',
      'lastRedirectTime',
      'authRedirectAttempt'
    ];
    
    authItems.forEach(item => safeSessionStorage.removeItem(item));
    
    // Clear Firebase auth related items
    const keysToRemove: string[] = [];
    
    // Find all Firebase auth related items
    for (let i = 0; i < safeSessionStorage.length(); i++) {
      const key = safeSessionStorage.key(i);
      if (key && (
        key.startsWith('firebase:') || 
        key.includes('firebaseui') || 
        key.includes('auth') ||
        key.includes('google')
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove them
    keysToRemove.forEach(key => {
      safeSessionStorage.removeItem(key);
    });
    
    // Clear auth-related cookies
    if (document.cookie) {
      const cookies = document.cookie.split(';');
      const authCookies = cookies.filter(cookie => 
        cookie.trim().startsWith('firebaseAuth') || 
        cookie.trim().startsWith('firebase') ||
        cookie.trim().includes('auth') ||
        cookie.trim().includes('google')
      );
      
      authCookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
    }
  } catch (e) {
    // Error handling without console logs
  }
};

// Function to log auth state for debugging
export const logAuthState = (user: User | null, loading: boolean) => {
  // Auth state logging removed for production
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
      return false;
    }
    
    // Update the last redirect time
    safeSessionStorage.setItem('lastRedirectTime', now.toString());
    
    // Get and increment the redirect count
    const redirectCountStr = safeSessionStorage.getItem('authRedirectCount');
    const redirectCount = redirectCountStr ? parseInt(redirectCountStr, 10) : 0;
    
    // If we've redirected more than 2 times in a row within 30 seconds, we might be in a loop
    if (redirectCount >= 2) {
      // Clear all auth-related storage to break the loop
      clearAuthSessionStorage();
      
      // Add error to URL
      safeUpdateUrl(url => {
        url.searchParams.set('error', 'redirect_loop_detected');
      });
      
      return true;
    }
    
    // Increment the redirect count
    safeSessionStorage.setItem('authRedirectCount', (redirectCount + 1).toString());
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
    // Error handling without console logs
  }
};

// Function to check if the browser supports popups
export const supportsPopups = (): boolean => {
  if (!isBrowser) return false;
  
  try {
    // Check if we're on the production site
    const isProduction = window.location.hostname.includes('firebaseapp.com') || 
                         window.location.hostname.includes('web.app') ||
                         !window.location.hostname.includes('localhost');
    
    // Always use redirect for production site
    if (isProduction) {
      return false;
    }
    
    // For localhost, use the original logic
    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) return false;
    
    // Check if we're in an iframe
    if (window.self !== window.top) return false;
    
    // Don't actually test popup creation as it can trigger COOP warnings
    // Instead, rely on browser capabilities and settings
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    
    // Modern browsers typically support popups
    return isChrome || isSafari || isFirefox;
  } catch (e) {
    // Error handling without console logs
    return false;
  }
};

// Test helper functions with COOP-safe checks
export const monitorAuthState = () => {
  if (!isBrowser) return;

  const getAuthState = () => ({
    sessionStorage: {
      signInAttempt: safeSessionStorage.getItem('signInAttempt'),
      signInTimestamp: safeSessionStorage.getItem('signInTimestamp'),
      authRedirectCount: safeSessionStorage.getItem('authRedirectCount'),
      lastRedirectTime: safeSessionStorage.getItem('lastRedirectTime'),
      authRedirectAttempt: safeSessionStorage.getItem('authRedirectAttempt'),
      popupSupported: supportsPopups()
    },
    browser: {
      userAgent: navigator.userAgent,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      isInIframe: window.self !== window.top,
      hostname: window.location.hostname,
      isProduction: window.location.hostname.includes('firebaseapp.com') || 
                   window.location.hostname.includes('web.app') ||
                   !window.location.hostname.includes('localhost')
    }
  });

  // Auth state monitoring (logs removed for production)
};

// Test scenarios
export const runAuthTests = async () => {
  // Auth tests removed for production
}; 