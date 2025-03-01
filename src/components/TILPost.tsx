import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon, ArrowPathIcon, LockClosedIcon, GlobeAltIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { PostDetailModal } from './PostDetailModal';
import { useRouter } from 'next/navigation';
import { getAvatarUrl, formatTimestamp } from '@/lib/utils';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { EngagementBar } from '@/components/ui/EngagementBar';
import { useAuth } from '@/lib/hooks/useAuth';
import { PopoverConfirm } from './ui/PopoverConfirm';

interface MediaAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  filename: string;
  mimeType: string;
}

interface Author {
  name: string;
  avatar?: string;
  id?: string;
}

interface Post {
  id: string;
  content: string;
  author: Author;
  category: string;
  createdAt: string;
  media?: MediaAttachment[];
  likes: number;
  comments: number;
  bookmarks: number;
  authorId?: string;
}

interface TILPostProps {
  post: Post;
  onLike: () => void;
  onBookmark: () => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  isLiked: boolean;
  isBookmarked: boolean;
}

export const TILPost: React.FC<TILPostProps> = ({
  post,
  onLike,
  onBookmark,
  onEdit,
  onDelete,
  isLiked,
  isBookmarked,
}) => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isContentTruncated, setIsContentTruncated] = useState(false);
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();

  const isOwnPost = Boolean(
    user && (
      (post.authorId && post.authorId === user.uid) ||
      (post.author.id && post.author.id === user.uid) ||
      post.author.name === user.displayName || 
      post.author.name === "Anonymous User"
    )
  );

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
      <div className="grid grid-cols-2 gap-2 mt-3">
        {displayMedia.map((media, index) => {
          if (media.type === 'image') {
            return (
              <div 
                key={index} 
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <Image
                  src={media.url}
                  alt={media.filename || `Image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover"
                  loading="lazy"
                />
                {showOverlay && index === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-white text-xl font-bold">+{thumbnailCount - 4}</span>
                  </div>
                )}
              </div>
            );
          }
          // ... existing code ...
        })}
      </div>
    );
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(post.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeletePopoverOpen(true);
  };

  const confirmDelete = () => {
    setIsDeletePopoverOpen(false);
    if (onDelete) {
      onDelete(post.id);
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.005 }}
        onClick={() => router.push(`/post/${post.id}`)}
        tabIndex={0}
        role="button"
        className="overflow-visible"
        aria-label={`View details of post: ${post.id}`}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(`/post/${post.id}`);
          }
        }}
      >
        <div className="flex flex-col gap-4 overflow-visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
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

            {/* {isOwnPost && (
              <div className="flex items-center gap-2 relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleEditClick}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Edit post"
                >
                  <PencilIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  ref={deleteButtonRef}
                  onClick={handleDeleteClick}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Delete post"
                >
                  <TrashIcon className="w-4 h-4 text-gray-600" />
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
            )} */}
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

          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <EngagementBar
              likes={post.likes}
              comments={post.comments}
              isLiked={isLiked}
              isBookmarked={isBookmarked}
              isOwnPost={isOwnPost}
              onLike={onLike}
              onBookmark={onBookmark}
            />
          </div>
        </div>
      </motion.article>
    </>
  );
}; 