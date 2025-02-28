import { motion } from 'framer-motion';
import Image from 'next/image';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface EngagementBarProps {
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  className?: string;
}

export const EngagementBar: React.FC<EngagementBarProps> = ({
  likes,
  comments,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-6">
        <motion.button
          onClick={onLike}
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

        <button 
          className="group flex items-center gap-2 text-black hover:text-black transition-colors"
          aria-label={`${comments} comments`}
        >
          <ChatBubbleLeftIcon className="w-5 h-5 group-hover:text-black transition-colors" />
          <span className="text-sm font-medium">{comments}</span>
        </button>
      </div>

      <motion.button
        onClick={onBookmark}
        whileTap={{ scale: 1.5 }}
        className="group relative flex items-center text-black hover:text-black transition-colors"
        aria-label={`${isBookmarked ? "Remove bookmark" : "Bookmark"} post`}
        aria-pressed={isBookmarked}
      >
        <div className="relative w-10 h-10 bookmark-shadow-hover">
          <Image
            src={isBookmarked ? '/bookmark-icon-clicked.svg' : '/bookmark-icon-default.svg'}
            alt="Bookmark icon"
            fill
            className="object-contain"
          />
        </div>
        <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap z-50">
          {isBookmarked ? 'Remove from Bucket' : 'Save to Bucket'}
          <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </motion.button>
    </div>
  );
}; 