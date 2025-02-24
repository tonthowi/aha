'use client';

import { useState } from 'react';
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
  const [currentTab, setCurrentTab] = useState('for-you');

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
  };

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl font-bold">Today I Learned</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium"
            >
              Share Learning
            </button>
          </div>
          <Tabs value={currentTab} className="w-full" onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="for-you" className="data-[state=active]:font-semibold">
                For You
              </TabsTrigger>
              <TabsTrigger value="following" className="data-[state=active]:font-semibold">
                Following
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto divide-y">
        {posts.map((post) => (
          <div key={post.id} className="px-4">
            <TILPost
              post={post}
              isLiked={likedPosts.has(post.id)}
              isBookmarked={bookmarkedPosts.has(post.id)}
              onLike={() => handleLike(post.id)}
              onBookmark={() => handleBookmark(post.id)}
            />
          </div>
        ))}
      </main>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}
