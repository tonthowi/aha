"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
      <main className="max-w-2xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Today I Learned</h1>
          <div className="flex items-center gap-4">
            <AuthButton />
          </div>
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
            <span className="text-gray-500 text-sm font-medium w-full text-center">Sign in to post your daily TILs</span>
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
