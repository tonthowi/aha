"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TILPost } from "@/components/TILPost";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePosts } from "@/lib/contexts/PostsContext";

export function TILFeed() {
  const { user } = useAuth();
  const { posts, toggleLike, toggleBookmark, likedPosts, bookmarkedPosts } = usePosts();
  const [currentTab, setCurrentTab] = useState("people-learned");

  // Filter posts based on the current tab
  const filteredPosts = posts.filter((post) => {
    if (currentTab === "i-learned") {
      return user ? post.author.name === user.displayName || post.author.name === "Anonymous User" : false;
    }
    return true; // Show all posts in "People Learned" tab
  });

  return (
    <div className="space-y-4">
      <nav aria-label="Content filter">
        <motion.div
          className="bg-white rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Tabs value={currentTab} className="w-full" onValueChange={setCurrentTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="people-learned">People Learned</TabsTrigger>
              <TabsTrigger value="i-learned">I Learned</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
      </nav>

      <section aria-label="Learning posts" className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: currentTab === "i-learned" ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: currentTab === "i-learned" ? -100 : 100 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4"
        >
          {filteredPosts.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center text-gray-500 py-8"
            >
              No posts to display in this section.
            </motion.p>
          ) : (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TILPost
                  post={post}
                  isLiked={likedPosts.has(post.id)}
                  isBookmarked={bookmarkedPosts.has(post.id)}
                  onLike={() => toggleLike(post.id)}
                  onBookmark={() => toggleBookmark(post.id)}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </section>
    </div>
  );
} 