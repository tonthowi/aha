"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import { HeartIcon, ChatBubbleLeftIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { usePosts } from "@/lib/contexts/PostsContext";
import { useEffect, useState } from "react";
import { getAvatarUrl, formatTimestamp } from "@/lib/utils";
import { Post } from "@/lib/contexts/PostsContext";

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { getPost, likedPosts, bookmarkedPosts, toggleLike, toggleBookmark } = usePosts();
  
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const postData = await getPost(postId);
        
        if (!postData) {
          setError("Post not found");
          router.push('/');
          return;
        }
        
        setPost(postData);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [postId, getPost, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-4"></div>
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-gray-700">{error || "Post not found"}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
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
              <div className="relative aspect-[16/9]">
                <Image
                  src={item.url}
                  alt={item.filename || "Post image"}
                  fill
                  className="rounded-2xl object-cover"
                  onError={(e) => {
                    // Fallback for failed image loads
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.src = "/images/placeholder.svg"; // Use SVG placeholder
                    imgElement.classList.add("error");
                  }}
                  unoptimized={true}
                  priority={index === 0}
                />
              </div>
            )}
            {item.type === "video" && (
              <video
                src={item.url}
                controls
                className="w-full rounded-2xl aspect-[16/9] object-cover"
                onError={(e) => {
                  console.error("Error loading video:", e);
                }}
              />
            )}
            {item.type === "audio" && (
              <audio
                src={item.url}
                controls
                className="w-full"
                onError={(e) => {
                  console.error("Error loading audio:", e);
                }}
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
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={getAvatarUrl(post.author.name, post.author.avatar)}
                alt={`${post.author.name}'s avatar`}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <time 
                className="text-sm text-gray-500 block"
                dateTime={post.createdAt}
                suppressHydrationWarning
              >
                {formatTimestamp(post.createdAt)}
              </time>
              <h1 className="text-lg font-semibold leading-tight">
                {post.author.name} has Learned
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <article>
          {/* Category */}
          <div className="mb-4">
            <span 
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              role="status"
            >
              {post.category}
            </span>
          </div>

          {/* Post content */}
          <div className="space-y-4">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {renderMediaContent()}
          </div>

          {/* Engagement toolbar */}
          <div className="mt-8 py-4 bg-gray-50 rounded-xl px-4">
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