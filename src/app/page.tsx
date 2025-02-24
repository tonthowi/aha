'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatePostModal } from '@/components/CreatePostModal';
import { TILPost } from '@/components/TILPost';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

// Temporary mock data
const initialPosts: Post[] = [
  {
    id: '1',
    title: 'Understanding TypeScript Generics',
    content: 'Today I learned about TypeScript generics and how they enable creating reusable components. They provide a way to make components work with any data type while still maintaining type safety. Here are some key concepts I discovered:\n\n1. Basic Generic Syntax\n2. Constraints using extends\n3. Default Type Parameters\n4. Generic Interfaces\n\nThis has really improved my understanding of type-safe components! 🚀',
    author: {
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    },
    category: 'Programming',
    createdAt: new Date().toISOString(),
    isPrivate: false,
    likes: 42,
    comments: 5,
    bookmarks: 12
  },
  {
    id: '2',
    title: 'Next.js App Router Features',
    content: 'Discovered some amazing features in Next.js 14 App Router! 🔥\n\nKey learnings:\n- Server Components by default\n- Nested Layouts\n- Server Actions\n- Streaming with Suspense\n- Route Handlers\n\nThe new mental model takes some getting used to, but the performance benefits are incredible! #webdev #nextjs',
    author: {
      name: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
    },
    category: 'Web Development',
    createdAt: new Date().toISOString(),
    isPrivate: false,
    likes: 38,
    comments: 7,
    bookmarks: 9
  }
];

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [currentTab, setCurrentTab] = useState('people-learned');

  const handleCreatePost = (newPost: {
    title: string;
    content: string;
    category: string;
    isPrivate: boolean;
    media?: MediaAttachment[];
  }) => {
    const post: Post = {
      id: Date.now().toString(),
      ...newPost,
      author: {
        name: 'Current User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current'
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      bookmarks: 0
    };

    setPosts([post, ...posts]);
    setCurrentTab('i-learned'); // Switch to "I Learned" tab after creating a post
  };

  // Filter posts based on the current tab
  const filteredPosts = posts.filter(post => {
    if (currentTab === 'i-learned') {
      return post.author.name === 'Current User';
    }
    return true; // Show all posts in "People Learned" tab
  });

  const handleLike = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  const handleBookmark = (postId: string) => {
    const newBookmarkedPosts = new Set(bookmarkedPosts);
    if (newBookmarkedPosts.has(postId)) {
      newBookmarkedPosts.delete(postId);
    } else {
      newBookmarkedPosts.add(postId);
    }
    setBookmarkedPosts(newBookmarkedPosts);
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b" role="banner">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl font-bold">Aha! - Today I Learned</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto space-y-4 p-4" role="main">
        <nav aria-label="Content filter">
          <motion.div 
            className="bg-white rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs value={currentTab} className="w-full" onValueChange={setCurrentTab}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="people-learned">
                  People Learned
                </TabsTrigger>
                <TabsTrigger value="i-learned">
                  I Learned
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        </nav>

        <motion.button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full bg-white hover:shadow-md rounded-2xl p-4 flex items-center gap-4 border-1 border-gray-200 hover:border-gray-300 transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label="Create new learning post"
        >
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg className="w-6 h-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-gray-500 text-sm font-medium">Today I Learned...</span>
        </motion.button>

        <section aria-label="Learning posts" className="space-y-4">
          <AnimatePresence mode="wait">
            {filteredPosts.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center text-gray-500 py-8"
              >
                No posts to display in this section.
              </motion.p>
            ) : (
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, x: currentTab === 'i-learned' ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: currentTab === 'i-learned' ? -100 : 100 }}
                transition={{ duration: 0.3 }}
                className="grid gap-4"
              >
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TILPost
                      post={post}
                      isLiked={likedPosts.has(post.id)}
                      isBookmarked={bookmarkedPosts.has(post.id)}
                      onLike={() => handleLike(post.id)}
                      onBookmark={() => handleBookmark(post.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}
