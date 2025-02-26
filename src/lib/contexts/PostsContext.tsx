"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

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

export interface Post {
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

// Initial posts data
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
    createdAt: '2025-02-25T06:30:00.000Z',
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
    createdAt: '2025-02-24T14:15:00.000Z',
    isPrivate: false,
    likes: 38,
    comments: 7,
    bookmarks: 9
  }
];

interface PostsContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'author' | 'createdAt' | 'likes' | 'comments' | 'bookmarks'>) => void;
  getPost: (id: string) => Post | undefined;
  likedPosts: Set<string>;
  bookmarkedPosts: Set<string>;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const addPost = (postData: Omit<Post, 'id' | 'author' | 'createdAt' | 'likes' | 'comments' | 'bookmarks'>) => {
    const newPost: Post = {
      id: Date.now().toString(),
      ...postData,
      author: {
        name: user?.displayName || 'Anonymous User',
        avatar: user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      bookmarks: 0
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const getPost = (id: string) => {
    return posts.find(post => post.id === id);
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  return (
    <PostsContext.Provider value={{
      posts,
      addPost,
      getPost,
      likedPosts,
      bookmarkedPosts,
      toggleLike,
      toggleBookmark,
    }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
} 