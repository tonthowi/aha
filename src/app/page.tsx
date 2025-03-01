"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CreatePostModal } from "@/components/CreatePostModal";
import { TILFeed } from "@/components/TILFeed";
import { usePosts } from "@/lib/contexts/PostsContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { AuthButton } from "@/components/AuthButton";
import toast from "react-hot-toast";
import AuthMethodIndicator from "@/components/AuthMethodIndicator";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { addPost } = usePosts();
  const { user, signInWithGoogle } = useAuth();

  const handleCreatePost = async (postData: any) => {
    try {
      setIsCreatingPost(true);
      const postId = await addPost(postData);
      setIsCreateModalOpen(false);
      toast.success("Your tidbit learning has been shared!");
      return postId; // Return the post ID so the modal knows the submission was successful
    } catch (error) {
      toast.error("Failed to share your learning. Please try again.");
      throw error; // Re-throw the error so the modal can handle it
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleCloseModal = () => {
    if (!isCreatingPost) {
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="relative w-40 h-28">
              <Image
                src="/TIL-logo-revamped.svg"
                alt="TIL - Today I Learned"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 160px"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <AuthButton />
            ) : (
              <button
                onClick={signInWithGoogle}
                className="btn-primary"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
          People sharing tidbits—brief facts you might find surprising or interesting.
          </h1>
          <AuthMethodIndicator />
        </div>

        <motion.button
          onClick={() => {
            if (user) {
              setIsCreateModalOpen(true);
            } else {
              signInWithGoogle();
            }
          }}
          className="card-shadow-hover w-full p-6 flex items-center gap-4 cursor-pointer group"
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label={user ? "Create new learning post" : "Sign in to create post"}
        >
          {user ? (
            <>
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff90e8] transition-colors" aria-hidden="true">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-[#666666] text-lg font-medium group-hover:text-black transition-colors">Today I Learned...</span>
            </>
          ) : (
            <div className="flex items-center justify-center w-full gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.766 12.277c0-.816-.067-1.636-.207-2.438H12.24v4.621h6.482c-.28 1.564-1.13 2.892-2.407 3.777v3.133h3.887c2.27-2.097 3.575-5.186 3.575-9.093z" fill="#4285F4"/>
                <path d="M12.24 24c3.24 0 5.956-1.075 7.961-2.907l-3.887-3.133c-1.079.752-2.458 1.195-4.074 1.195-3.13 0-5.78-2.122-6.729-4.975h-4.02v3.233C3.534 21.27 7.565 24 12.24 24z" fill="#34A853"/>
                <path d="M5.511 14.18c-.24-.72-.377-1.49-.377-2.28 0-.79.137-1.56.377-2.28V6.387h-4.02C.577 8.008 0 10.02 0 12.1c0 2.08.577 4.092 1.491 5.713l4.02-3.233z" fill="#FBBC05"/>
                <path d="M12.24 4.844c1.763 0 3.347.607 4.595 1.794l3.45-3.45C18.205 1.19 15.489 0 12.24 0 7.565 0 3.534 2.73 1.491 6.387l4.02 3.233c.949-2.853 3.599-4.975 6.729-4.975z" fill="#EA4335"/>
              </svg>
              <span className="text-lg font-medium">Sign in to share your tidbits learnings.</span>
            </div>
          )}
        </motion.button>

        <div className="pt-4">
          <TILFeed />
        </div>

        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleCreatePost}
        />
      </main>
    </div>
  );
}
