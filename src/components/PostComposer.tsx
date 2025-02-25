import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface PostComposerProps {
  onPost: (content: string, attachments: File[]) => void;
}

export function PostComposer({ onPost }: PostComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const handlePost = () => {
    if (!content.trim() && attachments.length === 0) return;
    onPost(content, attachments);
    setContent('');
    setAttachments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  if (!user) return null;

  return (
    <div className="border-b p-4">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Image
            src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={`${user.displayName || 'User'}'s avatar`}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="flex-grow">
          <textarea
            placeholder="What did you learn today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[100px] resize-none text-lg placeholder:text-gray-500 bg-transparent border-none focus:ring-0"
          />
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {attachments.map((file, index) => (
                <div key={index} className="relative aspect-video bg-gray-100 rounded-xl">
                  {file.type.startsWith('image/') && (
                    <Image
                      src={URL.createObjectURL(file)}
                      alt="Attachment"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover rounded-xl"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            <button
              onClick={handlePost}
              disabled={!content.trim() && attachments.length === 0}
              className="px-4 py-1.5 bg-blue-500 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 