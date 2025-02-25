/**
 * Authentication utilities to help with debugging and managing auth state
 */

import { User } from 'firebase/auth';

// Function to clear all auth-related session storage
export const clearAuthSessionStorage = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('signInAttempt');
    sessionStorage.removeItem('signInTimestamp');
    sessionStorage.removeItem('authRedirectCount');
    sessionStorage.removeItem('usingSafeGoogleAuth');
    sessionStorage.removeItem('lastRedirectTime');
    
    // Also clear any Firebase auth persistence items that might be causing issues
    const keysToRemove: string[] = [];
    
    // Find all Firebase auth related items
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('firebase:') || key.includes('firebaseui'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove them
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    console.log('[Auth] Cleared auth session storage');
    
    // Also try to clear any problematic cookies
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
export const detectAuthRedirectLoop = () => {
  if (typeof window !== 'undefined') {
    // Get the current timestamp
    const now = Date.now();
    const lastRedirectTime = parseInt(sessionStorage.getItem('lastRedirectTime') || '0', 10);
    const timeSinceLastRedirect = now - lastRedirectTime;
    
    // If it's been more than 30 seconds since the last redirect, reset the counter
    if (timeSinceLastRedirect > 30000) {
      sessionStorage.setItem('authRedirectCount', '0');
    }
    
    // Update the last redirect time
    sessionStorage.setItem('lastRedirectTime', now.toString());
    
    // Get and increment the redirect count
    const redirectCount = parseInt(sessionStorage.getItem('authRedirectCount') || '0', 10);
    sessionStorage.setItem('authRedirectCount', (redirectCount + 1).toString());
    
    // If we've redirected more than 3 times in a row within 30 seconds, we might be in a loop
    if (redirectCount >= 3) {
      console.error('[Auth] Possible redirect loop detected!');
      // Reset the counter and add an error to the URL
      sessionStorage.setItem('authRedirectCount', '0');
      
      // Clear all auth-related session storage to break the loop
      clearAuthSessionStorage();
      
      // Add error to URL
      const url = new URL(window.location.href);
      url.searchParams.set('error', 'redirect_loop_detected');
      window.history.replaceState({}, '', url.toString());
      return true;
    }
    
    return false;
  }
  return false;
};

// Reset redirect count when auth is successful
export const resetRedirectCount = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('authRedirectCount', '0');
    sessionStorage.removeItem('lastRedirectTime');
  }
};

// Function to check if the browser supports popups
export const supportsPopups = () => {
  if (typeof window === 'undefined') return false;
  
  // Check if we're on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) return false;
  
  // Check if popups are blocked
  try {
    const popup = window.open('about:blank', '_blank', 'width=1,height=1');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      return false;
    }
    popup.close();
    return true;
  } catch (e) {
    return false;
  }
}; 