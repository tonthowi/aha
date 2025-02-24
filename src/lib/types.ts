export interface MediaAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  filename: string;
  mimeType: string;
}

export interface Author {
  name: string;
  handle?: string;
  avatar: string;
}

export interface Post {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  media?: MediaAttachment[];
  likes: number;
  retweets: number;
  comments: number;
  views: number;
} 