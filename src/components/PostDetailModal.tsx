import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon, ChatBubbleLeftIcon, ArrowPathIcon, BookmarkIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

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
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="relative">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <Image
                          src={post.author.avatar}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{post.author.name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()} · {post.category}
                        </p>
                      </div>
                    </div>
                    {post.isPrivate && (
                      <div className="flex items-center text-yellow-500">
                        <LockClosedIcon className="w-5 h-5" />
                        <span className="ml-1">Private</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
                  <div 
                    className="prose prose-lg max-w-none mb-6"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {post.media && post.media.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {post.media.map((item, index) => (
                        <div key={index} className="rounded-lg overflow-hidden">
                          {item.type === 'image' && (
                            <div className="relative h-[500px] w-full">
                              <Image
                                src={item.url}
                                alt={item.filename}
                                fill
                                sizes="(max-width: 768px) 100vw, 800px"
                                className="object-contain bg-black"
                              />
                            </div>
                          )}
                          {item.type === 'video' && (
                            <video
                              src={item.url}
                              controls
                              className="w-full rounded-lg"
                            />
                          )}
                          {item.type === 'audio' && (
                            <div className="bg-gray-100 p-4 rounded-lg">
                              <p className="text-sm font-medium mb-2">{item.filename}</p>
                              <audio
                                src={item.url}
                                controls
                                className="w-full"
                              />
                            </div>
                          )}
                          {item.type === 'file' && (
                            <a
                              href={item.url}
                              download={item.filename}
                              className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <p className="text-lg font-medium text-gray-900">
                                {item.filename}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.mimeType}
                              </p>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={onLike}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-500"
                      >
                        {isLiked ? (
                          <HeartSolidIcon className="w-6 h-6 text-red-500" />
                        ) : (
                          <HeartIcon className="w-6 h-6" />
                        )}
                        <span className="text-lg">{post.likes + (isLiked ? 1 : 0)}</span>
                      </button>

                      <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500">
                        <ChatBubbleLeftIcon className="w-6 h-6" />
                        <span className="text-lg">{post.comments}</span>
                      </button>

                      <button className="flex items-center gap-2 text-gray-500 hover:text-green-500">
                        <ArrowPathIcon className="w-6 h-6" />
                      </button>
                    </div>

                    <button
                      onClick={onBookmark}
                      className="text-gray-500 hover:text-yellow-500"
                    >
                      {isBookmarked ? (
                        <BookmarkSolidIcon className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <BookmarkIcon className="w-6 h-6" />
                      )}
                    </button>
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