// Firestore Database Schema Types

// User document shape (users collection)
export interface UserRecord {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

// Post document shape (posts collection)
export interface PostRecord {
  id: string;
  content: string;
  authorId: string; // References a user ID
  authorName: string;
  authorPhotoURL?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  isPrivate?: boolean;
  media?: {
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
    filename: string;
    mimeType: string;
  }[];
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
}

// Like document shape (likes collection)
export interface LikeRecord {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

// Bookmark document shape (bookmarks collection)
export interface BookmarkRecord {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

// Comment document shape (comments collection)
export interface CommentRecord {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
} 