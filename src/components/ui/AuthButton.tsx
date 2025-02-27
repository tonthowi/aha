import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export function AuthButton() {
  const { user, signInWithGoogle, signOut } = useAuth();

  if (user) {
    return (
      <div className="relative group">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 p-1 rounded-full hover:opacity-80 transition-opacity"
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
        <div className="absolute right-0 mt-1 w-[280px] bg-[#f7f7f7] rounded-xl shadow-sm border border-[#e6e6e6] invisible group-hover:visible z-50 transform opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="px-4 py-3">
            <div className="text-[15px] font-medium text-gray-900">
              {user.displayName || 'User'}
            </div>
            <div className="text-[13px] text-gray-500">
              {user.email}
            </div>
          </div>
          <div className="h-[1px] bg-[#e6e6e6]"></div>
          <div className="p-1">
            <Link 
              href="/profile"
              className="block px-3 py-[6px] text-[15px] text-gray-600 hover:bg-white rounded-lg transition-all duration-150"
            >
              Profile
            </Link>
            <button
              onClick={signOut}
              className="w-full text-left px-3 py-[6px] text-[15px] text-gray-600 hover:bg-white rounded-lg transition-all duration-150"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={signInWithGoogle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center px-4 py-2 rounded-md bg-black text-white hover:opacity-80 transition-opacity text-sm font-medium"
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