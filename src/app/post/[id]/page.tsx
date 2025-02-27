"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import { HeartIcon, ChatBubbleLeftIcon, BookmarkIcon, LockClosedIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { usePosts } from "@/lib/contexts/PostsContext";
import { useEffect } from "react";
import { getAvatarUrl } from "@/lib/utils";

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { getPost, likedPosts, bookmarkedPosts, toggleLike, toggleBookmark } = usePosts();
  
  const post = getPost(postId);

  // If post not found, redirect to home
  useEffect(() => {
    if (!post) {
      router.push('/');
    }
  }, [post, router]);

  if (!post) {
    return null;
  }

  const isLiked = likedPosts.has(postId);
  const isBookmarked = bookmarkedPosts.has(postId);

  const renderMediaContent = () => {
    if (!post.media || post.media.length === 0) return null;

    return (
      <div className="mt-4 space-y-4">
        {post.media.map((item, index) => (
          <div key={index} className="relative">
            {item.type === "image" && (
              <Image
                src={item.url}
                alt={item.filename}
                width={800}
                height={450}
                className="rounded-2xl"
              />
            )}
            {item.type === "video" && (
              <video
                src={item.url}
                controls
                className="w-full rounded-2xl"
              />
            )}
            {item.type === "audio" && (
              <audio
                src={item.url}
                controls
                className="w-full"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <article>
          {/* Author info */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={getAvatarUrl(post.author.name, post.author.avatar)}
                  alt={`${post.author.name}'s avatar`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="font-bold truncate">{post.author.name}</span>
                <span className="text-gray-500" aria-hidden="true">·</span>
                <time 
                  className="text-gray-500"
                  dateTime={post.createdAt}
                  suppressHydrationWarning
                >
                  {new Date(post.createdAt).toLocaleDateString()}
                </time>
                <span className="text-gray-500" aria-hidden="true">·</span>
                {post.isPrivate ? (
                  <div className="flex items-center gap-1 text-yellow-600" role="status">
                    <LockClosedIcon className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm">Private</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600" role="status">
                    <GlobeAltIcon className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm">Public</span>
                  </div>
                )}
              </div>
              <span 
                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                role="status"
              >
                {post.category}
              </span>
            </div>
          </div>

          {/* Post content */}
          <div className="space-y-4">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {renderMediaContent()}
          </div>

          {/* Engagement stats */}
          <div className="mt-8 py-4 border-y">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-10">
                <motion.button
                  onClick={() => toggleLike(postId)}
                  whileTap={{ scale: 0.9 }}
                  className="group flex items-center gap-2 text-gray-500"
                  aria-label={`${isLiked ? "Unlike" : "Like"} post (${post.likes + (isLiked ? 1 : 0)} likes)`}
                  aria-pressed={isLiked}
                >
                  <motion.div 
                    className="p-2 -m-2 group-hover:bg-red-50 rounded-full transition-colors"
                    animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" aria-hidden="true" />
                    ) : (
                      <HeartIcon className="w-6 h-6 group-hover:text-red-500" aria-hidden="true" />
                    )}
                  </motion.div>
                  <motion.span
                    key={post.likes + (isLiked ? 1 : 0)}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`text-sm ${isLiked ? "text-red-500" : "group-hover:text-red-500"}`}
                  >
                    {post.likes + (isLiked ? 1 : 0)}
                  </motion.span>
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  className="group flex items-center gap-2 text-gray-500"
                  aria-label={`${post.comments} comments`}
                >
                  <div className="p-2 -m-2 group-hover:bg-blue-50 rounded-full transition-colors">
                    <ChatBubbleLeftIcon className="w-6 h-6 group-hover:text-blue-500" aria-hidden="true" />
                  </div>
                  <span className="text-sm group-hover:text-blue-500">{post.comments}</span>
                </motion.button>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleBookmark(postId)}
                className="group p-2 -m-2 text-gray-500"
                aria-label={`${isBookmarked ? "Remove bookmark" : "Bookmark"} post`}
                aria-pressed={isBookmarked}
              >
                <motion.div 
                  className="group-hover:bg-yellow-50 rounded-full p-2 -m-2 transition-colors"
                  animate={isBookmarked ? { scale: [1, 1.2, 1] } : {}}
                >
                  {isBookmarked ? (
                    <BookmarkSolidIcon className="w-6 h-6 text-yellow-500" aria-hidden="true" />
                  ) : (
                    <BookmarkIcon className="w-6 h-6 group-hover:text-yellow-500" aria-hidden="true" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
} 