"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CreatePostModal } from "@/components/CreatePostModal";
import { TILFeed } from "@/components/TILFeed";
import { usePosts } from "@/lib/contexts/PostsContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { AuthButton } from "@/components/AuthButton";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { addPost } = usePosts();
  const { user, signInWithGoogle } = useAuth();

  const handleCreatePost = async (postData: any) => {
    await addPost(postData);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative w-16 h-16">
            <Image
              src="/TIL logo.svg"
              alt="Today I Learned"
              fill
              className="object-contain"
              priority
            />
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <AuthButton />
            </div>
          )}
        </div>

        <motion.button
          onClick={() => user ? setIsCreateModalOpen(true) : signInWithGoogle()}
          className="w-full bg-white hover:shadow-md rounded-2xl p-4 flex items-center gap-4 border border-gray-200 hover:border-gray-300 transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label={user ? "Create new learning post" : "Sign in to create post"}
        >
          {user ? (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <svg className="w-6 h-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-gray-500 text-sm font-medium">Today I Learned...</span>
            </>
          ) : (
            <div className="flex items-center justify-center w-full gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.766 12.277c0-.816-.067-1.636-.207-2.438H12.24v4.621h6.482c-.28 1.564-1.13 2.892-2.407 3.777v3.133h3.887c2.27-2.097 3.575-5.186 3.575-9.093z" fill="#4285F4"/>
                <path d="M12.24 24c3.24 0 5.956-1.075 7.961-2.907l-3.887-3.133c-1.079.752-2.458 1.195-4.074 1.195-3.13 0-5.78-2.122-6.729-4.975h-4.02v3.233C3.534 21.27 7.565 24 12.24 24z" fill="#34A853"/>
                <path d="M5.511 14.18c-.24-.72-.377-1.49-.377-2.28 0-.79.137-1.56.377-2.28V6.387h-4.02C.577 8.008 0 10.02 0 12.1c0 2.08.577 4.092 1.491 5.713l4.02-3.233z" fill="#FBBC05"/>
                <path d="M12.24 4.844c1.763 0 3.347.607 4.595 1.794l3.45-3.45C18.205 1.19 15.489 0 12.24 0 7.565 0 3.534 2.73 1.491 6.387l4.02 3.233c.949-2.853 3.599-4.975 6.729-4.975z" fill="#EA4335"/>
              </svg>
              <span className="text-gray-500 text-sm font-medium">Sign in to post your daily TILs</span>
            </div>
          )}
        </motion.button>

        <TILFeed />

        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      </main>
    </div>
  );
}
