import { motion } from 'framer-motion';
import Image from 'next/image';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';

interface EngagementBarProps {
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isOwnPost?: boolean;
  onLike: () => void;
  onBookmark: () => void;
  className?: string;
}

export const EngagementBar: React.FC<EngagementBarProps> = ({
  likes,
  comments,
  isLiked,
  isBookmarked,
  isOwnPost = false,
  onLike,
  onBookmark,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { user } = useAuth();

  const handleLikeClick = () => {
    if (!user) {
      toast.error('Sign in to like');
      return;
    }
    onLike();
  };

  const handleBookmarkClick = () => {
    if (!user) {
      toast.error('Sign in to save to bucket');
      return;
    }
    setShowTooltip(false);
    onBookmark();
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-6">
        {!isOwnPost && (
          <motion.button
            onClick={handleLikeClick}
            whileTap={{ scale: 1.5 }}
            className="group flex items-center gap-2 text-black hover:text-black transition-colors"
            aria-label={`${isLiked ? "Unlike" : "Like"} post (${likes + (isLiked ? 1 : 0)} likes)`}
            aria-pressed={isLiked}
          >
            {isLiked ? (
              <HeartSolidIcon className="w-5 h-5 text-black" />
            ) : (
              <HeartIcon className="w-5 h-5 group-hover:text-black transition-colors" />
            )}
            <span className="text-sm font-medium">
              {likes + (isLiked ? 1 : 0)}
            </span>
          </motion.button>
        )}

        <button 
          className="group flex items-center gap-2 text-black hover:text-black transition-colors"
          aria-label={`${comments} comments`}
        >
          <ChatBubbleLeftIcon className="w-5 h-5 group-hover:text-black transition-colors" />
          <span className="text-sm font-medium">{comments}</span>
        </button>
      </div>

      {!isOwnPost && (
        <motion.button
          onClick={handleBookmarkClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          whileTap={{ scale: 0.8 }}
          className="group relative flex items-center text-black hover:text-black transition-colors"
          aria-label={`${isBookmarked ? "Remove bookmark" : "Bookmark"} post`}
          aria-pressed={isBookmarked}
        >
          <div className="relative w-12 h-12">
            <Image
              src={isBookmarked ? '/bookmark-icon-clicked.svg' : '/bookmark-icon-default.svg'}
              alt="Bookmark icon"
              fill
              className="object-contain"
            />
          </div>
          <div className={`absolute ${showTooltip ? 'visible opacity-100' : 'invisible opacity-0'} transition-opacity duration-300 right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap z-50`}>
            {isBookmarked ? 'Remove from Bucket' : 'Save to Bucket'}
            <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </motion.button>
      )}
    </div>
  );
}; 