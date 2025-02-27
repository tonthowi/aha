"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { PostRecord } from '@/lib/types/schema';
import { 
  createPost,
  getPosts, 
  getPostById,
  getUserLikes,
  getUserBookmarks,
  subscribeToPostUpdates,
  subscribeToUserLikes,
  subscribeToUserBookmarks,
  toggleLike as firebaseToggleLike,
  toggleBookmark as firebaseToggleBookmark
} from '@/lib/firebase/firebaseUtils';

interface MediaAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  filename: string;
  mimeType: string;
}

interface Author {
  name: string;
  avatar?: string;
}

export interface Post {
  id: string;
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
    content: 'Today I learned about TypeScript generics and how they enable creating reusable components. They provide a way to make components work with any data type while still maintaining type safety. Here are some key concepts I discovered:\n\n1. Basic Generic Syntax\n2. Constraints using extends\n3. Default Type Parameters\n4. Generic Interfaces\n\nThis has really improved my understanding of type-safe components! 🚀',
    author: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60'
    },
    category: '💻 Programming',
    createdAt: '2025-02-25T06:30:00.000Z',
    isPrivate: false,
    likes: 42,
    comments: 5,
    bookmarks: 12
  },
  {
    id: '2',
    content: 'Discovered some amazing features in Next.js 14 App Router! 🔥\n\nKey learnings:\n- Server Components by default\n- Nested Layouts\n- Server Actions\n- Streaming with Suspense\n- Route Handlers\n\nThe new mental model takes some getting used to, but the performance benefits are incredible! #webdev #nextjs',
    author: {
      name: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60'
    },
    category: '🌐 Web Development',
    createdAt: '2025-02-24T14:15:00.000Z',
    isPrivate: false,
    likes: 38,
    comments: 7,
    bookmarks: 9
  },
  {
    id: '3',
    content: 'This is a test post to verify the avatar placeholder functionality.',
    author: {
      name: 'John Smith',
    },
    category: '💻 Programming',
    createdAt: new Date().toISOString(),
    isPrivate: false,
    likes: 0,
    comments: 0,
    bookmarks: 0
  }
];

interface PostsContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'author' | 'createdAt' | 'likes' | 'comments' | 'bookmarks'>) => Promise<string>;
  getPost: (id: string) => Promise<Post | null>;
  likedPosts: Set<string>;
  bookmarkedPosts: Set<string>;
  isLoading: boolean;
  toggleLike: (postId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Convert Firebase PostRecord to Post for UI
function convertFirebasePostToUIPost(postRecord: PostRecord): Post {
  return {
    id: postRecord.id,
    content: postRecord.content,
    author: {
      name: postRecord.authorName,
      avatar: postRecord.authorPhotoURL,
    },
    category: postRecord.category,
    createdAt: postRecord.createdAt,
    isPrivate: postRecord.isPrivate,
    media: postRecord.media,
    likes: postRecord.likeCount,
    comments: postRecord.commentCount,
    bookmarks: postRecord.bookmarkCount,
  };
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load posts from Firebase on component mount
  useEffect(() => {
    setIsLoading(true);
    
    // Set up real-time listeners
    const unsubscribePosts = subscribeToPostUpdates((postRecords) => {
      const convertedPosts = postRecords.map(convertFirebasePostToUIPost);
      setPosts(convertedPosts);
      setIsLoading(false);
    });
    
    // Clean up listeners on unmount
    return () => {
      unsubscribePosts();
    };
  }, []);
  
  // Load user's likes and bookmarks when user changes
  useEffect(() => {
    if (!user) {
      setLikedPosts(new Set());
      setBookmarkedPosts(new Set());
      return;
    }
    
    // Set up realtime listeners for likes and bookmarks
    const unsubscribeLikes = subscribeToUserLikes(user.uid, (likedPostIds) => {
      setLikedPosts(new Set(likedPostIds));
    });
    
    const unsubscribeBookmarks = subscribeToUserBookmarks(user.uid, (bookmarkedPostIds) => {
      setBookmarkedPosts(new Set(bookmarkedPostIds));
    });
    
    // Clean up listeners on unmount or when user changes
    return () => {
      unsubscribeLikes();
      unsubscribeBookmarks();
    };
  }, [user]);
  
  const addPost = async (postData: Omit<Post, 'id' | 'author' | 'createdAt' | 'likes' | 'comments' | 'bookmarks'>): Promise<string> => {
    if (!user) {
      throw new Error("You must be logged in to create a post");
    }
    
    // Convert to Firebase format
    const firebasePostData = {
      content: postData.content,
      category: postData.category,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous User',
      authorPhotoURL: user.photoURL || undefined,
      isPrivate: postData.isPrivate,
      media: postData.media || [],
    };
    
    // Create post in Firebase
    const postId = await createPost(firebasePostData);
    
    return postId;
  };

  const getPost = async (id: string): Promise<Post | null> => {
    const postRecord = await getPostById(id);
    return postRecord ? convertFirebasePostToUIPost(postRecord) : null;
  };

  const toggleLike = async (postId: string): Promise<void> => {
    if (!user) {
      throw new Error("You must be logged in to like posts");
    }
    
    await firebaseToggleLike(postId, user.uid);
  };

  const toggleBookmark = async (postId: string): Promise<void> => {
    if (!user) {
      throw new Error("You must be logged in to bookmark posts");
    }
    
    await firebaseToggleBookmark(postId, user.uid);
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        addPost,
        getPost,
        likedPosts,
        bookmarkedPosts,
        isLoading,
        toggleLike,
        toggleBookmark,
      }}
    >
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