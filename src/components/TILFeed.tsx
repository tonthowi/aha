"use client";

import { useState, useCallback } from "react";
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
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Implement real refresh function that uses Firebase
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshError(null);
      
      // The real-time listeners in the PostsContext will automatically 
      // update when data changes in Firebase, so we don't need to manually 
      // refresh. This is just a placeholder in case you want to add 
      // additional refresh logic.
      
      // Simulate network delay for better UX feedback
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      return true;
    } catch (error) {
      console.error("Error refreshing feed:", error);
      setRefreshError("Failed to refresh. Please try again.");
      return false;
    }
  }, []);

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

  const handleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (error) {
      console.error("Error liking post:", error);
      // Could show toast notification here
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      await toggleBookmark(postId);
    } catch (error) {
      console.error("Error bookmarking post:", error);
      // Could show toast notification here
    }
  };

  return (
    <div 
      ref={elementRef}
      className="max-w-6xl mx-auto space-y-8"
    >
      <RefreshSpinner
        progress={pullProgress}
        isRefreshing={isRefreshing}
      />

      <nav aria-label="Content filter" className="max-w-2xl mx-auto w-full px-4">
        <motion.div
          className="card-shadow-hover overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            transform: isPulling ? `translateY(${pullProgress * 50}px)` : undefined,
          }}
        >
          <Tabs value={currentTab} className="w-full" onValueChange={setCurrentTab}>
            <TabsList className="w-full grid grid-cols-3 p-1 bg-transparent">
              <TabsTrigger 
                value="for-you"
                className="data-[state=active]:bg-black data-[state=active]:text-white rounded-xl transition-colors"
              >
                💎 For You
              </TabsTrigger>
              <TabsTrigger 
                value="today-i-learned"
                className="data-[state=active]:bg-black data-[state=active]:text-white rounded-xl transition-colors"
              >
                💡 Mine
              </TabsTrigger>
              <TabsTrigger 
                value="bookmarked"
                className="data-[state=active]:bg-black data-[state=active]:text-white rounded-xl transition-colors"
              >
                🔖 Saved
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
      </nav>

      <ErrorBoundary>
        <motion.section 
          aria-label="Learning posts"
          className="max-w-[1400px] mx-auto w-full px-4"
          style={{
            transform: isPulling ? `translateY(${pullProgress * 50}px)` : undefined,
          }}
        >
          {refreshError && (
            <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-lg text-center">
              {refreshError}
            </div>
          )}
          
          {isLoading ? (
            <MasonryGridSkeleton itemCount={6} />
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 px-6 card-shadow-hover"
            >
              <div className="text-center">
                <h3 className="mt-2 text-xl font-bold tracking-tight text-black">No posts yet</h3>
                <p className="mt-3 text-[#666666]">
                  {getEmptyStateMessage()}
                </p>
              </div>
            </motion.div>
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