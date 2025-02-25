/**
 * Debug utilities to ensure debug function is available globally
 */

// Define a global debug function if it doesn't exist
if (typeof window !== 'undefined') {
  // Create a more robust debug function
  const createDebugFunction = () => {
    return function(...args: any[]) {
      try {
        console.log('[Debug]', ...args);
      } catch (e) {
        // Fallback if spreading doesn't work
        console.log('[Debug]', args);
      }
    };
  };

  // Set the debug function on window
  if (!window.hasOwnProperty('debug')) {
    (window as any).debug = createDebugFunction();
    console.log('[System] Global debug function initialized');
  }

  // Create a special debug function that won't throw errors
  (window as any).safeDebug = function(...args: any[]) {
    try {
      if ((window as any).debug) {
        (window as any).debug(...args);
      } else {
        console.log('[Debug]', ...args);
      }
    } catch (e) {
      console.log('[Debug] Error in debug function:', e);
    }
  };
}

// Export a debug function that uses the global one if available
export const debug = (...args: any[]) => {
  if (typeof window !== 'undefined') {
    if ((window as any).debug) {
      try {
        (window as any).debug(...args);
      } catch (e) {
        console.log('[Debug]', ...args);
      }
    } else {
      console.log('[Debug]', ...args);
    }
  } else {
    console.log('[Debug]', ...args);
  }
};

// Helper function to safely call debug functions and catch any errors
export const safeDebug = (callback: () => void) => {
  try {
    callback();
  } catch (error) {
    console.error('[Debug Error]', error);
  }
};

// Check if debug is available
export const isDebugAvailable = () => {
  return typeof window !== 'undefined' && !!(window as any).debug;
};

// Function to debug authentication issues
export const debugAuth = () => {
  if (typeof window === 'undefined') return;
  
  // Log all session storage items
  console.group('Session Storage Debug');
  const sessionItems: Record<string, string> = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const value = sessionStorage.getItem(key);
      sessionItems[key] = value || '';
    }
  }
  console.table(sessionItems);
  console.groupEnd();
  
  // Log all local storage items
  console.group('Local Storage Debug');
  const localItems: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      localItems[key] = value || '';
    }
  }
  console.table(localItems);
  console.groupEnd();
  
  // Log browser info
  console.group('Browser Info');
  console.log('User Agent:', navigator.userAgent);
  console.log('Cookies Enabled:', navigator.cookieEnabled);
  console.log('Language:', navigator.language);
  console.log('Online:', navigator.onLine);
  console.groupEnd();
  
  // Add a global function to debug auth
  (window as any).debugAuth = debugAuth;
};

// Initialize debug on import
safeDebug(() => {
  debug('Debug utilities loaded');
  
  // Initialize auth debugging
  if (typeof window !== 'undefined') {
    (window as any).debugAuth = debugAuth;
  }
}); 