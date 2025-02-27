import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon, ArrowPathIcon, BookmarkIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { PostDetailModal } from './PostDetailModal';
import { useRouter } from 'next/navigation';
import { getAvatarUrl, formatTimestamp } from '@/lib/utils';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryPill } from '@/components/ui/CategoryPill';

interface MediaAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  filename: string;
  mimeType: string;
}

interface Author {
  name: string;
  avatar?: string;
}

interface Post {
  id: string;
  content: string;
  author: Author;
  category: string;
  createdAt: string;
  isPrivate: boolean;
  media?: MediaAttachment[];
  likes: number;
  comments: number;
  bookmarks: number;
}

interface TILPostProps {
  post: Post;
  onLike: () => void;
  onBookmark: () => void;
  isLiked: boolean;
  isBookmarked: boolean;
}

export const TILPost: React.FC<TILPostProps> = ({
  post,
  onLike,
  onBookmark,
  isLiked,
  isBookmarked,
}) => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isContentTruncated, setIsContentTruncated] = useState(false);

  useEffect(() => {
    const checkContentHeight = () => {
      if (contentRef.current) {
        const maxHeight = 320; // 20rem
        setIsContentTruncated(contentRef.current.scrollHeight > maxHeight);
      }
    };

    checkContentHeight();
    // Re-check when window is resized
    window.addEventListener('resize', checkContentHeight);
    return () => window.removeEventListener('resize', checkContentHeight);
  }, [post.content]);

  // Parse categories string into array and format display
  const formatCategories = (categoryString: string) => {
    return categoryString.split(', ');
  };

  const renderMediaThumbnails = () => {
    if (!post.media || post.media.length === 0) return null;

    const thumbnailCount = post.media.length;
    const showOverlay = thumbnailCount > 4;
    const displayMedia = post.media.slice(0, 4);

    return (
      <div
        className={`grid mt-3 mb-2 cursor-pointer ${
          thumbnailCount === 1 ? 'grid-cols-1' :
          thumbnailCount === 2 ? 'grid-cols-2' :
          'grid-cols-2'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/post/${post.id}`);
        }}
      >
        {displayMedia.map((item, index) => (
          <div
            key={index}
            className={`relative ${
              thumbnailCount === 1 ? 'aspect-[16/9]' :
              thumbnailCount === 2 ? 'aspect-square' :
              index === 0 ? 'aspect-square' : 'aspect-square'
            } ${
              thumbnailCount > 2 && index === 0 ? 'col-span-2' : ''
            } overflow-hidden`}
          >
            {item.type === 'image' && (
              <Image
                src={item.url}
                alt={item.filename}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                unoptimized={true}
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = "/images/placeholder.svg";
                }}
              />
            )}
            {item.type === 'video' && (
              <div className="relative h-full w-full bg-gray-100">
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            {item.type === 'audio' && (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            )}
            {item.type === 'file' && (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {showOverlay && index === 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{thumbnailCount - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.005 }}
      onClick={() => router.push(`/post/${post.id}`)}
      tabIndex={0}
      role="button"
      aria-label={`View details of post: ${post.id}`}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/post/${post.id}`);
        }
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="relative">
                <Image
                  src={getAvatarUrl(post.author.name, post.author.avatar)}
                  alt={`${post.author.name}'s avatar`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            <div className="flex flex-col min-w-0">
              <span className="font-semibold pb-1 text-black truncate">{post.author.name}</span>
              <time 
                className="text-xs text-gray-500"
                dateTime={post.createdAt}
                suppressHydrationWarning
              >
                {formatTimestamp(post.createdAt)}
              </time>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {formatCategories(post.category).map((category, index) => (
            <CategoryPill 
              key={index}
              category={category}
            />
          ))}
        </div>

        <div className="mt-1">
          <div 
            ref={contentRef}
            className={`prose prose-sm text-black relative ${
              isContentTruncated ? 'max-h-[20rem] overflow-hidden' : ''
            }`}
          >
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            {isContentTruncated && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                <div 
                  className="absolute bottom-0 left-0 right-0 flex justify-center pb-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/post/${post.id}`);
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-1 text-sm font-medium text-black border border-[#e6e6e6] hover:border-black rounded-full transition-all card-shadow-hover"
                  >
                    Read More →
                  </motion.button>
                </div>
              </>
            )}
          </div>

          {renderMediaThumbnails()}
        </div>

        <div className="flex items-center justify-between mt-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-6">
            <motion.button
              onClick={onLike}
              whileTap={{ scale: 0.9 }}
              className="group flex items-center gap-2 text-[#666666] hover:text-black transition-colors"
              aria-label={`${isLiked ? 'Unlike' : 'Like'} post (${post.likes + (isLiked ? 1 : 0)} likes)`}
            >
              {isLiked ? (
                <HeartSolidIcon className="w-5 h-5 text-[#ff90e8]" />
              ) : (
                <HeartIcon className="w-5 h-5 group-hover:text-black transition-colors" />
              )}
              <span className="text-sm font-medium">
                {post.likes + (isLiked ? 1 : 0)}
              </span>
            </motion.button>

            <motion.button
              onClick={onBookmark}
              whileTap={{ scale: 0.9 }}
              className="group flex items-center gap-2 text-[#666666] hover:text-black transition-colors"
              aria-label={`${isBookmarked ? 'Remove from' : 'Add to'} bookmarks (${post.bookmarks + (isBookmarked ? 1 : 0)} bookmarks)`}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="w-5 h-5 text-[#ff90e8]" />
              ) : (
                <BookmarkIcon className="w-5 h-5 group-hover:text-black transition-colors" />
              )}
              <span className="text-sm font-medium">
                {post.bookmarks + (isBookmarked ? 1 : 0)}
              </span>
            </motion.button>

            <Link
              href={`/post/${post.id}`}
              className="group flex items-center gap-2 text-[#666666] hover:text-black transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatBubbleLeftIcon className="w-5 h-5 group-hover:text-black transition-colors" />
              <span className="text-sm font-medium">{post.comments}</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}; 