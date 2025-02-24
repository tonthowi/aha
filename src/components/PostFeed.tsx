import { TILPost } from './TILPost';

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

interface PostFeedProps {
  posts: Post[];
  likedPosts: Set<string>;
  bookmarkedPosts: Set<string>;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

export function PostFeed({ posts, likedPosts, bookmarkedPosts, onLike, onBookmark }: PostFeedProps) {
  return (
    <main className="max-w-2xl mx-auto divide-y">
      {posts.map((post) => (
        <div key={post.id} className="px-4">
          <TILPost
            post={post}
            isLiked={likedPosts.has(post.id)}
            isBookmarked={bookmarkedPosts.has(post.id)}
            onLike={() => onLike(post.id)}
            onBookmark={() => onBookmark(post.id)}
          />
        </div>
      ))}
    </main>
  );
} 