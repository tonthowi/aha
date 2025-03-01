"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import { HeartIcon, ChatBubbleLeftIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { usePosts } from "@/lib/contexts/PostsContext";
import { useEffect, useState, useRef } from "react";
import { getAvatarUrl, formatTimestamp } from "@/lib/utils";
import { Post as PostContextType } from "@/lib/contexts/PostsContext";
import { CategoryPill } from '@/components/ui/CategoryPill';
import { EngagementBar } from '@/components/ui/EngagementBar';
import { useAuth } from "@/lib/hooks/useAuth";
import { PopoverConfirm } from "@/components/ui/PopoverConfirm";

// Extended interfaces for this component
interface Author {
  name: string;
  avatar?: string;
  id?: string; // Add id field
}

interface Post extends Omit<PostContextType, 'author'> {
  author: Author;
  authorId?: string; // Add authorId field
}

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { getPost, likedPosts, bookmarkedPosts, toggleLike, toggleBookmark, deletePost } = usePosts();
  const { user } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

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
  
  // Updated ownership check that uses authorId if available, falling back to name comparison
  const isOwnPost = Boolean(
    user && post && (
      // First check if post has authorId directly
      (post.authorId && post.authorId === user.uid) ||
      // Then check if author object has id
      (post.author.id && post.author.id === user.uid) ||
      // Fall back to name comparison for backward compatibility
      post.author.name === user.displayName || 
      post.author.name === "Anonymous User"
    )
  );

  const handleEditClick = () => {
    router.push(`/post/${postId}/edit`);
  };

  const handleDeleteClick = () => {
    setIsDeletePopoverOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeletePopoverOpen(false);
      await deletePost(postId);
      router.push('/');
    } catch (error) {
      console.error("Error deleting post:", error);
      // Could show error toast notification here
    }
  };

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white backdrop-blur-sm border-b border-black">
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
              <h1 className="text-lg font-semibold pb-1">
                {post.author.name}
              </h1>
              <time 
                className="text-xs text-gray-500 block"
                dateTime={post.createdAt}
                suppressHydrationWarning
              >
                {formatTimestamp(post.createdAt)}
              </time>
            </div>

            {isOwnPost && (
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={handleEditClick}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Edit post"
                >
                  <PencilIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  ref={deleteButtonRef}
                  onClick={handleDeleteClick}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Delete post"
                >
                  <TrashIcon className="w-5 h-5 text-gray-600" />
                </button>
                
                <PopoverConfirm
                  isOpen={isDeletePopoverOpen}
                  message="Are you sure you want to delete this post? This action cannot be undone."
                  confirmText="Delete"
                  onConfirm={confirmDelete}
                  onCancel={() => setIsDeletePopoverOpen(false)}
                  isDestructive={true}
                  position="bottom"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <article className="bg-white rounded-xl p-6">
          {/* Category */}
          <div className="mb-4">
            <CategoryPill category={post.category} />
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
          <EngagementBar
            className="mt-8"
            likes={post.likes}
            comments={post.comments}
            isLiked={isLiked}
            isBookmarked={isBookmarked}
            isOwnPost={isOwnPost}
            onLike={() => toggleLike(postId)}
            onBookmark={() => toggleBookmark(postId)}
          />
        </article>
      </main>
    </div>
  );
} 