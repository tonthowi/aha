"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useState } from "react";

interface SignInButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export default function SignInButton({
  className = "",
  variant = "primary",
  size = "md",
}: SignInButtonProps) {
  const { user, signInWithGoogle, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Determine if we're on localhost
  const isLocalhost = typeof window !== "undefined" && 
    (window.location.hostname.includes("localhost") || 
     window.location.hostname.includes("127.0.0.1"));

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Don't show the button if user is already signed in
  if (user) {
    return null;
  }

  // Base styles
  let buttonStyles = "flex items-center justify-center gap-2 font-medium transition-colors ";
  
  // Size styles
  if (size === "sm") {
    buttonStyles += "px-3 py-1.5 text-sm ";
  } else if (size === "lg") {
    buttonStyles += "px-6 py-3 text-lg ";
  } else {
    buttonStyles += "px-4 py-2 ";
  }
  
  // Variant styles
  if (variant === "primary") {
    buttonStyles += "bg-blue-600 hover:bg-blue-700 text-white ";
  } else if (variant === "secondary") {
    buttonStyles += "bg-gray-200 hover:bg-gray-300 text-gray-800 ";
  } else {
    buttonStyles += "border border-gray-300 hover:bg-gray-100 ";
  }
  
  // Rounded corners
  buttonStyles += "rounded-md ";
  
  // Disabled state
  if (isSigningIn || loading) {
    buttonStyles += "opacity-70 cursor-not-allowed ";
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isSigningIn || loading}
      className={`${buttonStyles} ${className}`}
      aria-label="Sign in with Google"
    >
      {/* Google Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
      >
        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
      </svg>
      
      {isSigningIn ? "Signing in..." : isLocalhost ? "Sign in with Google (Popup)" : "Sign in with Google (Redirect)"}
    </button>
  );
} 