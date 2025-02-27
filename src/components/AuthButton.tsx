import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { clearAuthSessionStorage } from '@/lib/utils/authUtils';

// Safe access to browser APIs
const isBrowser = typeof window !== 'undefined';

// Helper for safely accessing sessionStorage
const getSessionItem = (key: string): string | null => {
  if (!isBrowser) return null;
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    console.error(`Error accessing sessionStorage for key ${key}:`, e);
    return null;
  }
};

// Helper for safely setting sessionStorage
const setSessionItem = (key: string, value: string): void => {
  if (!isBrowser) return;
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.error(`Error setting sessionStorage for key ${key}:`, e);
  }
};

// Helper for safely removing sessionStorage item
const removeSessionItem = (key: string): void => {
  if (!isBrowser) return;
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing sessionStorage for key ${key}:`, e);
  }
};

export function AuthButton() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signInStartTime, setSignInStartTime] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Reset states when auth state changes
  useEffect(() => {
    if (user) {
      setIsSigningIn(false);
      setSignInStartTime(null);
      setError(null);
      clearAuthSessionStorage();
    }
  }, [user]);

  // Check for sign-in attempt on mount and after redirects
  useEffect(() => {
    const checkSignInState = () => {
      const signInAttempt = sessionStorage.getItem('signInAttempt');
      const signInTimestamp = sessionStorage.getItem('signInTimestamp');
      
      if (signInAttempt === 'true' && signInTimestamp) {
        setIsSigningIn(true);
        setSignInStartTime(parseInt(signInTimestamp, 10));
      } else {
        setIsSigningIn(false);
        setSignInStartTime(null);
      }
    };

    // Check immediately
    checkSignInState();

    // Set up interval to check periodically
    const intervalId = setInterval(checkSignInState, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Handle timeout
  useEffect(() => {
    if (!isSigningIn || !signInStartTime) return;

    const timeoutId = setTimeout(() => {
      const elapsed = Date.now() - signInStartTime;
      if (elapsed > 30000) { // 30 seconds timeout
        console.warn('[Auth] Sign-in timeout reached');
        setIsSigningIn(false);
        setSignInStartTime(null);
        setError('Sign-in timed out. Please try again.');
        clearAuthSessionStorage();
      }
    }, 30000);

    return () => clearTimeout(timeoutId);
  }, [isSigningIn, signInStartTime]);

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

    if (isBrowser) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown' && isDropdownOpen) {
      e.preventDefault();
      // Focus the first item in the dropdown
      const firstItem = dropdownRef.current?.querySelector('a, button') as HTMLElement;
      firstItem?.focus();
    }
  };

  // Handle keyboard navigation within dropdown menu
  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentElement = document.activeElement;
      const nextSibling = currentElement?.nextElementSibling as HTMLElement;
      if (nextSibling) {
        nextSibling.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentElement = document.activeElement;
      const previousSibling = currentElement?.previousElementSibling as HTMLElement;
      if (previousSibling) {
        previousSibling.focus();
      } else {
        buttonRef.current?.focus();
      }
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsSigningIn(true);
      setSignInStartTime(Date.now());
      
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Sign in failed:', error);
      setIsSigningIn(false);
      setSignInStartTime(null);
      setError(error.message);
      clearAuthSessionStorage();
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setIsDropdownOpen(false);
      await signOut();
    } catch (error: any) {
      console.error('Sign out failed:', error);
      setIsSigningOut(false);
      setError(error.message);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    clearAuthSessionStorage();
    setTimeout(handleGoogleSignIn, 500);
  };

  // Calculate elapsed time for sign-in
  const getElapsedTimeText = () => {
    if (!signInStartTime) return '';
    
    const elapsed = Math.floor((Date.now() - signInStartTime) / 1000);
    if (elapsed < 10) return '';
    
    return `(${elapsed}s)`;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-10 w-10">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-end">
        <div className="text-red-600 text-sm mb-2">{error}</div>
        <button
          onClick={handleRetry}
          className="btn-outline text-sm px-4 py-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isSigningIn) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-[#666666]">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#666666]"></div>
        <span>Signing in{getElapsedTimeText()}</span>
      </div>
    );
  }

  if (isSigningOut) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-[#666666]">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#666666]"></div>
        <span>Signing out...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <motion.button
          ref={buttonRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          onKeyDown={handleKeyDown}
        >
          <div className="relative card-shadow-hover hover:border hover:border-white w-10 h-10 overflow-hidden">
            <Image
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid || 'default'}`}
              alt={`${user.displayName || 'User'}'s profile picture`}
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.button>

        {isDropdownOpen && (
          <div 
            className="dropdown-menu card-shadow-hover"
            onKeyDown={handleMenuKeyDown}
          >
            <div className="px-4 py-2">
              <div className="font-medium text-black truncate">
                {user.displayName || 'Anonymous User'}
              </div>
              <div className="text-sm text-[#666666] truncate">
                {user.email || 'No email'}
              </div>
            </div>
            
            <Link 
              href="/profile"
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              Profile
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full text-left dropdown-item text-red-600 hover:text-red-700"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleGoogleSignIn}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="btn-primary"
      disabled={isSigningIn}
    >
      <div className="flex items-center gap-2">
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
        Sign in
      </div>
    </motion.button>
  );
} 