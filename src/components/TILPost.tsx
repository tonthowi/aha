import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon, ArrowPathIcon, BookmarkIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { PostDetailModal } from './PostDetailModal';
import { useRouter } from 'next/navigation';

interface MediaAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  filename: string;
  mimeType: string;
}

interface Author {
  name: string;
  avatar: string;
}

interface Post {
  id: string;
  title: string;
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

  // Parse categories string into array and format display
  const formatCategories = (categoryString: string) => {
    const categories = categoryString.split(', ');
    if (categories.length <= 1) return categories[0];
    return `${categories[0]} ${categories.length - 1}+`;
  };

  const renderMediaThumbnails = () => {
    if (!post.media || post.media.length === 0) return null;

    const thumbnailCount = post.media.length;
    const showOverlay = thumbnailCount > 4;
    const displayMedia = post.media.slice(0, 4);

    return (
      <div
        className={`grid gap-0.5 mt-3 mb-2 cursor-pointer rounded-2xl overflow-hidden ${
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
            }`}
          >
            {item.type === 'image' && (
              <Image
                src={item.url}
                alt={item.filename}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
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
      whileHover={{ scale: 1.02 }}
      className="p-6 cursor-pointer bg-white shadow-sm hover:shadow-md transition-colors rounded-2xl"
      onClick={() => router.push(`/post/${post.id}`)}
      tabIndex={0}
      role="button"
      aria-label={`View details of post: ${post.title}`}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/post/${post.id}`);
        }
      }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image
              src={post.author.avatar}
              alt={`${post.author.name}'s avatar`}
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between pb-4 border-b">
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
                <div className="flex items-center gap-1 text-yellow-600 ml-2" role="status">
                  <LockClosedIcon className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm">Private</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600 ml-2" role="status">
                  <GlobeAltIcon className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm">Public</span>
                </div>
              )}
            </div>
            <span 
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700"
              role="status"
            >
              {formatCategories(post.category)}
            </span>
          </div>

          <div className="mt-3">
            <h2 className="font-bold">{post.title}</h2>
            <div 
              className="prose prose-sm mt-1 line-clamp-4 text-gray-800"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {renderMediaThumbnails()}
          </div>

          <div className="flex items-center justify-between mt-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-10">
              <motion.button
                onClick={onLike}
                whileTap={{ scale: 0.9 }}
                className="group flex items-center gap-2 text-gray-500"
                aria-label={`${isLiked ? 'Unlike' : 'Like'} post (${post.likes + (isLiked ? 1 : 0)} likes)`}
                aria-pressed={isLiked}
              >
                <motion.div 
                  className="p-2 -m-2 group-hover:bg-red-50 rounded-full transition-colors"
                  animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                >
                  {isLiked ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-500" aria-hidden="true" />
                  ) : (
                    <HeartIcon className="w-5 h-5 group-hover:text-red-500" aria-hidden="true" />
                  )}
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={post.likes + (isLiked ? 1 : 0)}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`text-sm ${isLiked ? 'text-red-500' : 'group-hover:text-red-500'}`}
                  >
                    {post.likes + (isLiked ? 1 : 0)}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="group flex items-center gap-2 text-gray-500"
                aria-label={`${post.comments} comments`}
              >
                <div className="p-2 -m-2 group-hover:bg-blue-50 rounded-full transition-colors">
                  <ChatBubbleLeftIcon className="w-5 h-5 group-hover:text-blue-500" aria-hidden="true" />
                </div>
                <span className="text-sm group-hover:text-blue-500">{post.comments}</span>
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="group flex items-center gap-2 text-gray-500"
                aria-label="Share post"
              >
                <div className="p-2 -m-2 group-hover:bg-green-50 rounded-full transition-colors">
                  <ArrowPathIcon className="w-5 h-5 group-hover:text-green-500" aria-hidden="true" />
                </div>
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBookmark}
              className="group p-2 -m-2 text-gray-500"
              aria-label={`${isBookmarked ? 'Remove bookmark' : 'Bookmark'} post`}
              aria-pressed={isBookmarked}
            >
              <motion.div 
                className="group-hover:bg-yellow-50 rounded-full p-2 -m-2 transition-colors"
                animate={isBookmarked ? { scale: [1, 1.2, 1] } : {}}
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="w-5 h-5 text-yellow-500" aria-hidden="true" />
                ) : (
                  <BookmarkIcon className="w-5 h-5 group-hover:text-yellow-500" aria-hidden="true" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}; 