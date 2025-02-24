import { TILPost } from './TILPost';

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
    likes: 38,
    comments: 7,
    bookmarks: 9
  }
];

export const TILFeed = () => {
  return (
    <div className="space-y-6">
      {mockPosts.map((post) => (
        <TILPost key={post.id} post={post} />
      ))}
    </div>
  );
}; 