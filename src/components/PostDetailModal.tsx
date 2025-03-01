import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon, ChatBubbleLeftIcon, ArrowPathIcon, BookmarkIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { getAvatarUrl } from '@/lib/utils';

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
  media?: MediaAttachment[];
  likes: number;
  comments: number;
  bookmarks: number;
}

interface PostDetailModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
}) => {
  const formatCategories = (categoryString: string) => {
    return categoryString.split(', ');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white border border-[#e6e6e6] shadow-lg text-left align-middle transition-all">
                <div className="flex items-center justify-between modal-header">
                  <Dialog.Title as="h3">
                    Post Details
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-full p-1 hover:bg-[#f7f7f7] transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#f7f7f7] border border-[#e6e6e6]">
                          <Image
                            src={getAvatarUrl(post.author.name, post.author.avatar)}
                            alt={`${post.author.name}'s avatar`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-black">{post.author.name}</div>
                        <div className="text-sm text-[#666666]">{post.createdAt}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {formatCategories(post.category).map((category, index) => (
                      <span 
                        key={index}
                        className="badge"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <div className="prose prose-sm max-w-none mb-6">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  </div>

                  {post.media && post.media.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {post.media.map((item, index) => (
                        <div key={index} className="rounded-xl overflow-hidden border border-[#e6e6e6]">
                          {item.type === 'image' && (
                            <div className="relative aspect-video">
                              <Image
                                src={item.url}
                                alt={item.filename}
                                fill
                                className="object-cover"
                                unoptimized={true}
                              />
                            </div>
                          )}
                          {item.type === 'video' && (
                            <video
                              src={item.url}
                              controls
                              className="w-full"
                            />
                          )}
                          {item.type === 'audio' && (
                            <audio
                              src={item.url}
                              controls
                              className="w-full p-4"
                            />
                          )}
                          {item.type === 'file' && (
                            <div className="p-4 flex items-center gap-3">
                              <svg className="w-8 h-8 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <div>
                                <div className="font-medium">{item.filename}</div>
                                <div className="text-sm text-[#666666]">{item.mimeType}</div>
                              </div>
                              <a
                                href={item.url}
                                download={item.filename}
                                className="ml-auto btn-outline text-sm px-3 py-1"
                              >
                                Download
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-[#e6e6e6]">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={onLike}
                        className="group flex items-center gap-2 text-[#666666] hover:text-black transition-colors"
                      >
                        {isLiked ? (
                          <HeartSolidIcon className="w-5 h-5 text-[#ff90e8]" />
                        ) : (
                          <HeartIcon className="w-5 h-5 group-hover:text-black transition-colors" />
                        )}
                        <span className="text-sm font-medium">
                          {post.likes + (isLiked ? 1 : 0)}
                        </span>
                      </button>

                      <button
                        onClick={onBookmark}
                        className="group flex items-center gap-2 text-[#666666] hover:text-black transition-colors"
                      >
                        {isBookmarked ? (
                          <BookmarkSolidIcon className="w-5 h-5 text-[#ff90e8]" />
                        ) : (
                          <BookmarkIcon className="w-5 h-5 group-hover:text-black transition-colors" />
                        )}
                        <span className="text-sm font-medium">
                          {post.bookmarks + (isBookmarked ? 1 : 0)}
                        </span>
                      </button>

                      <div className="group flex items-center gap-2 text-[#666666]">
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 