"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AuthMethodIndicator() {
  const { user } = useAuth();
  const [authMethod, setAuthMethod] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if redirect auth was used
      const usingRedirectAuth = sessionStorage.getItem('usingRedirectAuth') === 'true';
      const redirectAuthSuccess = sessionStorage.getItem('redirectAuthSuccess') === 'true';
      
      if (redirectAuthSuccess) {
        setAuthMethod('Successfully authenticated using redirect-based authentication');
      } else if (usingRedirectAuth) {
        setAuthMethod('Using redirect-based authentication');
      } else if (user) {
        setAuthMethod('Authenticated using popup-based authentication');
      } else {
        setAuthMethod('Authentication method will be determined when you sign in');
      }
    }
  }, [user]);

  if (!authMethod) return null;

  return (
    <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded-md text-sm">
      <p>{authMethod}</p>
      <p className="text-xs mt-1 text-blue-500">
        {user ? 'You are signed in' : 'You are not signed in'}
      </p>
    </div>
  );
} 