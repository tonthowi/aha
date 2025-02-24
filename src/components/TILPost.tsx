import { useState } from 'react';
import Image from 'next/image';
import { HeartIcon, ChatBubbleLeftIcon, ArrowPathIcon, BookmarkIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { PostDetailModal } from './PostDetailModal';

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
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
        onClick={() => setIsDetailOpen(true)}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
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
    <>
      <article
        className="py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsDetailOpen(true)}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="font-bold truncate">{post.author.name}</span>
              <span className="text-gray-500">·</span>
              <time className="text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</time>
              <span className="text-gray-500">·</span>
              {post.isPrivate ? (
                <div className="flex items-center gap-1 text-yellow-600">
                  <LockClosedIcon className="w-4 h-4" />
                  <span className="text-sm">Private</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600">
                  <GlobeAltIcon className="w-4 h-4" />
                  <span className="text-sm">Public</span>
                </div>
              )}
              <span className="text-gray-500">·</span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {post.category}
              </span>
            </div>

            <h2 className="font-bold mt-1">{post.title}</h2>
            <div 
              className="prose prose-sm mt-1 line-clamp-4 text-gray-800"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {renderMediaThumbnails()}

            <div className="flex items-center justify-between mt-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-10">
                <button
                  onClick={onLike}
                  className="group flex items-center gap-2 text-gray-500"
                >
                  <div className="p-2 -m-2 group-hover:bg-red-50 rounded-full transition-colors">
                    {isLiked ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 group-hover:text-red-500" />
                    )}
                  </div>
                  <span className={`text-sm ${isLiked ? 'text-red-500' : 'group-hover:text-red-500'}`}>
                    {post.likes + (isLiked ? 1 : 0)}
                  </span>
                </button>

                <button className="group flex items-center gap-2 text-gray-500">
                  <div className="p-2 -m-2 group-hover:bg-blue-50 rounded-full transition-colors">
                    <ChatBubbleLeftIcon className="w-5 h-5 group-hover:text-blue-500" />
                  </div>
                  <span className="text-sm group-hover:text-blue-500">{post.comments}</span>
                </button>

                <button className="group flex items-center gap-2 text-gray-500">
                  <div className="p-2 -m-2 group-hover:bg-green-50 rounded-full transition-colors">
                    <ArrowPathIcon className="w-5 h-5 group-hover:text-green-500" />
                  </div>
                </button>
              </div>

              <button
                onClick={onBookmark}
                className="group p-2 -m-2 text-gray-500"
              >
                <div className="group-hover:bg-yellow-50 rounded-full p-2 -m-2 transition-colors">
                  {isBookmarked ? (
                    <BookmarkSolidIcon className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5 group-hover:text-yellow-500" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </article>

      <PostDetailModal
        post={post}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        onLike={onLike}
        onBookmark={onBookmark}
      />
    </>
  );
}; 