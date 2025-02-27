"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TILPost } from "@/components/TILPost";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePosts } from "@/lib/contexts/PostsContext";
import { MasonryGrid, MasonryItem } from "@/components/masonry";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MasonryGridSkeleton } from "@/components/skeletons/MasonryGridSkeleton";
import { usePullToRefresh } from "@/lib/hooks/usePullToRefresh";
import { RefreshSpinner } from "@/components/RefreshSpinner";

export function TILFeed() {
  const { user } = useAuth();
  const { posts, toggleLike, toggleBookmark, likedPosts, bookmarkedPosts, isLoading } = usePosts();
  const [currentTab, setCurrentTab] = useState("for-you");

  // Simulate refresh function - replace with actual refresh logic
  const handleRefresh = async () => {
    // Add your refresh logic here
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const { elementRef, isPulling, isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh: handleRefresh,
    pullDistance: 100,
  });

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
        return "You haven't shared any learnings yet. Start sharing what you've learned!";
      case "bookmarked":
        return "No bookmarked posts yet. When you find interesting learnings from others, bookmark them to save for later!";
      default:
        return "No posts to display in this section yet.";
    }
  };

  return (
    <div 
      ref={elementRef}
      className="max-w-7xl mx-auto space-y-6 min-h-screen"
    >
      <RefreshSpinner
        progress={pullProgress}
        isRefreshing={isRefreshing}
      />

      <nav aria-label="Content filter" className="max-w-2xl mx-auto w-full">
        <motion.div
          className="bg-white rounded-2xl overflow-hidden shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            transform: isPulling ? `translateY(${pullProgress * 50}px)` : undefined,
          }}
        >
          <Tabs value={currentTab} className="w-full" onValueChange={setCurrentTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="for-you">❤️ For You</TabsTrigger>
              <TabsTrigger value="today-i-learned">💡 My TIL</TabsTrigger>
              <TabsTrigger value="bookmarked">🔖 Saved</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
      </nav>

      <ErrorBoundary>
        <motion.section 
          aria-label="Learning posts"
          className="max-w-[1400px] mx-auto w-full"
          style={{
            transform: isPulling ? `translateY(${pullProgress * 50}px)` : undefined,
          }}
        >
          {isLoading ? (
            <MasonryGridSkeleton itemCount={6} />
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl shadow-sm"
            >
              <div className="text-center">
                <h3 className="mt-2 text-lg font-medium text-gray-900">No posts yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {getEmptyStateMessage()}
                </p>
              </div>
            </motion.div>
          ) : (
            <MasonryGrid className="w-full">
              {filteredPosts.map((post) => (
                <MasonryItem key={post.id}>
                  <TILPost
                    post={post}
                    isLiked={likedPosts.has(post.id)}
                    isBookmarked={bookmarkedPosts.has(post.id)}
                    onLike={() => toggleLike(post.id)}
                    onBookmark={() => toggleBookmark(post.id)}
                  />
                </MasonryItem>
              ))}
            </MasonryGrid>
          )}
        </motion.section>
      </ErrorBoundary>
    </div>
  );
} 