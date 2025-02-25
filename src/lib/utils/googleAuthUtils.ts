/**
 * Utilities for handling Google authentication
 */

import { GoogleAuthProvider, signInWithRedirect, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';

/**
 * Sign in with Google with special handling for debug errors
 */
export const signInWithGoogleSafely = async () => {
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
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
      
      // Store a flag to indicate we're using the safe mode
      sessionStorage.setItem('usingSafeGoogleAuth', 'true');
    }
    
    // Add a global debug function to the window before redirecting
    if (typeof window !== 'undefined') {
      // Make sure debug is defined globally
      if (!window.hasOwnProperty('debug')) {
        (window as any).debug = function(...args: any[]) {
          console.log('[Debug]', ...args);
        };
      }
      
      // Also add it to localStorage to try to persist it across domains
      try {
        localStorage.setItem('debugFunctionDefined', 'true');
      } catch (e) {
        console.warn('[Auth] Could not store debug flag in localStorage', e);
      }
    }
    
    // Try popup first for better user experience, fall back to redirect if needed
    try {
      // Check if we're on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Use redirect for mobile devices
        console.log('[Auth] Using redirect for mobile device');
        await signInWithRedirect(auth, provider);
      } else {
        // Try popup for desktop
        console.log('[Auth] Attempting popup authentication');
        const result = await signInWithPopup(auth, provider);
        console.log('[Auth] Popup authentication successful', result.user.email);
        return result;
      }
    } catch (popupError) {
      console.warn('[Auth] Popup authentication failed, falling back to redirect', popupError);
      // Fall back to redirect method
      await signInWithRedirect(auth, provider);
    }
    
    console.log('[Auth] Redirect initiated');
  } catch (error) {
    console.error('[Auth] Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Check if we need to handle debug errors
 */
export const checkForDebugErrors = () => {
  if (typeof window !== 'undefined') {
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
  }
};

// Run the check immediately
checkForDebugErrors(); 