import { TILPost } from './TILPost';
import { useState } from 'react';

// Temporary mock data
const mockPosts = [
  {
    id: '1',
    title: 'Understanding TypeScript Generics',
    content: 'Today I learned about TypeScript generics and how they enable creating reusable components...',
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
    content: 'Discovered some amazing features in Next.js 14 App Router including server components...',
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

export const TILFeed = () => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <div className="space-y-12">
      {mockPosts.map((post) => (
        <TILPost 
          key={post.id} 
          post={post}
          isLiked={likedPosts.has(post.id)}
          isBookmarked={bookmarkedPosts.has(post.id)}
          onLike={() => handleLike(post.id)}
          onBookmark={() => handleBookmark(post.id)}
        />
      ))}
    </div>
  );
}; 