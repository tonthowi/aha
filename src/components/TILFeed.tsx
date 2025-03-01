"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TILPost } from "@/components/TILPost";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePosts } from "@/lib/contexts/PostsContext";
import { MasonryGrid, MasonryItem } from "@/components/masonry";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MasonryGridSkeleton } from "@/components/skeletons/MasonryGridSkeleton";
import { SparklesIcon, UserIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export function TILFeed() {
  const { user } = useAuth();
  const { posts, toggleLike, toggleBookmark, deletePost, likedPosts, bookmarkedPosts, isLoading } = usePosts();
  const [currentTab, setCurrentTab] = useState("for-you");
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const router = useRouter();

  // Filter posts based on the current tab
  const filteredPosts = posts.filter((post) => {
    switch (currentTab) {
      case "today-i-learned":
        // Show only the user's own posts
        return user ? post.author.name === user.displayName || post.author.name === "Anonymous User" : false;
      case "bookmarked":
        // Show only bookmarked posts from others
        return bookmarkedPosts.has(post.id) && (!user || post.author.name !== user.displayName);
      case "for-you":
      default:
        // Show all posts
        return true;
    }
  });

  // Get empty state message based on current tab
  const getEmptyStateMessage = () => {
    switch (currentTab) {
      case "today-i-learned":
        return "Your brain is empty. Learn something new!";
      case "bookmarked":
        return "Why don't you find something interesting from others, TIL it up!";
      default:
        return "People are fucking dumb!";
    }
  };

  // Get empty state image based on current tab
  const getEmptyStateImage = () => {
    switch (currentTab) {
      case "today-i-learned":
        return "/you-learned-nothing.svg";
      case "bookmarked":
        return "/empty-bucket.svg";
      default:
        return "/you-learned-nothing.svg";
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (error) {
      // Could show toast notification here
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      await toggleBookmark(postId);
    } catch (error) {
      // Could show toast notification here
    }
  };

  const handleEdit = (postId: string) => {
    router.push(`/post/${postId}/edit`);
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      // Could show success toast notification here
    } catch (error) {
      // Could show error toast notification here
    }
  };

  return (
    <div 
      className="max-w-6xl mx-auto space-y-8"
    >
      <nav aria-label="Content filter" className="max-w-2xl mx-auto w-full">
        <div
          className="card-shadow-hover overflow-hidden"
        >
          <Tabs value={currentTab} className="w-full" onValueChange={setCurrentTab}>
            <TabsList className="w-full grid grid-cols-3 p-1 bg-transparent">
              <TabsTrigger 
                value="for-you"
                className="data-[state=active]:bg-black data-[state=active]:text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                For You
              </TabsTrigger>
              <TabsTrigger 
                value="today-i-learned"
                className="data-[state=active]:bg-black data-[state=active]:text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <UserIcon className="w-5 h-5" />
                Mine
              </TabsTrigger>
              <TabsTrigger 
                value="bookmarked"
                className="data-[state=active]:bg-black data-[state=active]:text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <BookmarkIcon className="w-5 h-5" />
                Save Bucket
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      <ErrorBoundary>
        <section 
          aria-label="Learning posts"
          className="max-w-[1400px] mx-auto w-full"
        >
          {refreshError && (
            <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-lg text-center">
              {refreshError}
            </div>
          )}
          
          {isLoading ? (
            <MasonryGridSkeleton itemCount={6} />
          ) : filteredPosts.length === 0 ? (
            <div
              className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 px-6"
            >
              <div className="text-center">
                <div className="relative w-40 h-40 mx-auto">
                  <Image
                    src={getEmptyStateImage()}
                    alt="Empty State icon"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 160px"
                  />
                </div>
                <p className="mt-3 text-black">
                  {getEmptyStateMessage()}
                </p>
              </div>
            </div>
          ) : (
            <MasonryGrid className="w-full gap-6">
              {filteredPosts.map((post) => (
                <MasonryItem key={post.id}>
                  <TILPost
                    post={post}
                    isLiked={likedPosts.has(post.id)}
                    isBookmarked={bookmarkedPosts.has(post.id)}
                    onLike={() => handleLike(post.id)}
                    onBookmark={() => handleBookmark(post.id)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </MasonryItem>
              ))}
            </MasonryGrid>
          )}
        </section>
      </ErrorBoundary>
    </div>
  );
} 