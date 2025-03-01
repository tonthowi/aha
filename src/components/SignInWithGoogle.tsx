"use client";

import Image from 'next/image';

import { useAuth } from '../lib/hooks/useAuth';

export default function SignInWithGoogle() {
  const { signInWithGoogle } = useAuth();

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center justify-center bg-white text-black font-medium py-2 px-4 rounded-lg border border-black hover:bg-[#f7f7f7] transition duration-300 ease-in-out"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5 mr-2" />
      Sign in with Google
    </button>
  );
}
