import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { clearAuthSessionStorage } from '@/lib/utils/authUtils';

export function AuthButton() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Store sign-in attempt in session storage to show loading state after redirect
  useEffect(() => {
    const checkSignInAttempt = () => {
      try {
        const signInAttempt = sessionStorage.getItem('signInAttempt');
        const signInTimestamp = sessionStorage.getItem('signInTimestamp');
        const usingSafeAuth = sessionStorage.getItem('usingSafeGoogleAuth');
        
        if (signInAttempt || usingSafeAuth) {
          setIsSigningIn(true);
          
          // Check if we have a user, an error, or if auth loading is complete
          if (!authLoading) {
            // If we have a user or there's an error in the URL, clear the sign-in attempt
            if (user || window.location.search.includes('error')) {
              sessionStorage.removeItem('signInAttempt');
              sessionStorage.removeItem('signInTimestamp');
              sessionStorage.removeItem('usingSafeGoogleAuth');
              setIsSigningIn(false);
              
              // Check for error in URL
              const urlParams = new URLSearchParams(window.location.search);
              const errorCode = urlParams.get('error');
              if (errorCode) {
                // Format the error message based on the error code
                let errorMessage = `Authentication error: ${errorCode}`;
                
                if (errorCode === 'redirect_loop_detected') {
                  errorMessage = 'Too many redirects detected. Please try again or use a different browser.';
                  console.error('Auth error from URL: redirect_loop_detected');
                } else if (errorCode.includes('debug is not defined')) {
                  errorMessage = 'There was an issue with the authentication process. Please try again.';
                  console.error('Auth error from URL: debug is not defined');
                } else {
                  console.error('Auth error from URL:', errorCode);
                }
                
                setError(errorMessage);
              }
            } else {
              // If no user and no error, check if we've been waiting too long (2 minutes)
              const now = Date.now();
              const timestamp = signInTimestamp ? parseInt(signInTimestamp, 10) : now;
              const timeElapsed = now - timestamp;
              
              if (timeElapsed > 120000) { // 2 minutes timeout (increased from 30 seconds)
                console.warn('Sign-in timeout reached, resetting state');
                sessionStorage.removeItem('signInAttempt');
                sessionStorage.removeItem('signInTimestamp');
                sessionStorage.removeItem('usingSafeGoogleAuth');
                setIsSigningIn(false);
                setError('Sign-in timed out. Please try again.');
              }
            }
          }
        }
      } catch (e) {
        console.error('Error checking sign-in attempt:', e);
        setIsSigningIn(false);
        sessionStorage.removeItem('signInAttempt');
        sessionStorage.removeItem('signInTimestamp');
        sessionStorage.removeItem('usingSafeGoogleAuth');
      }
    };
    
    // Check immediately and then set up an interval to check periodically
    checkSignInAttempt();
    const intervalId = setInterval(checkSignInAttempt, 2000); // Check every 2 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [authLoading, user]);

  // Clear error parameters from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('error')) {
      // Remove the error parameter but keep other parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
    
    // Make sure debug is defined
    if (typeof window !== 'undefined' && !window.hasOwnProperty('debug')) {
      (window as any).debug = function(...args: any[]) {
        console.log('[Debug]', ...args);
      };
    }
  }, []);

  // Reset signing out state when user changes
  useEffect(() => {
    if (isSigningOut && !user && !authLoading) {
      setIsSigningOut(false);
    }
  }, [user, authLoading, isSigningOut]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      buttonRef.current?.focus();
    }
  };

  // Handle Google Sign In with improved browser compatibility
  const handleGoogleSignIn = async () => {
    try {
      // Clear any previous errors or sign-in attempts
      setError(null);
      clearAuthSessionStorage();
      
      setIsSigningIn(true);
      // Store sign-in attempt in session storage to maintain state across redirects
      sessionStorage.setItem('signInAttempt', 'true');
      sessionStorage.setItem('signInTimestamp', Date.now().toString());
      
      // Make sure debug is defined before redirecting
      if (typeof window !== 'undefined' && !window.hasOwnProperty('debug')) {
        (window as any).debug = function(...args: any[]) {
          console.log('[Debug]', ...args);
        };
      }
      
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      sessionStorage.removeItem('signInAttempt');
      sessionStorage.removeItem('signInTimestamp');
      sessionStorage.removeItem('usingSafeGoogleAuth');
      setIsSigningIn(false);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  // Handle sign out with proper state management
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setIsDropdownOpen(false); // Close dropdown immediately
      await signOut();
      // The useEffect will reset isSigningOut when user becomes null
    } catch (error) {
      console.error('Sign out failed:', error);
      setIsSigningOut(false);
      setError(error instanceof Error ? error.message : 'Sign out failed');
    }
  };

  // Add a manual reset button when in signing in state
  const handleCancelSignIn = () => {
    clearAuthSessionStorage();
    setIsSigningIn(false);
    setError(null);
  };

  // Handle retry after error
  const handleRetry = () => {
    setError(null);
    // Clear all auth-related session storage before retrying
    clearAuthSessionStorage();
    // Wait a moment before retrying
    setTimeout(() => {
      handleGoogleSignIn();
    }, 500);
  };

  // Show loading state during authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-8 w-8">
        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show signing out state
  if (isSigningOut) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg shadow">
        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Signing out...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div 
        className="relative"
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
        onKeyDown={handleKeyDown}
      >
        <motion.button
          ref={buttonRef}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt="Profile picture"
              fill
              className="object-cover"
            />
          </div>
        </motion.button>
        
        {/* Invisible connector to prevent gap between button and dropdown */}
        <div className="absolute right-0 w-48 h-2 -bottom-2"></div>
        
        {isDropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu"
          >
            <Link 
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      {isSigningIn ? (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg shadow">
            <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Signing in...</span>
          </div>
          <button 
            onClick={handleCancelSignIn}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      ) : (
        <motion.button
          onClick={handleGoogleSignIn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          aria-label="Sign in with Google"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </motion.button>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <p>{error}</p>
          <div className="mt-2 flex justify-end">
            <button 
              onClick={handleRetry}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 