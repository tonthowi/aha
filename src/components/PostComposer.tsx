import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { uploadFile } from '@/lib/firebase/firebaseUtils';
import { PhotoIcon, FaceSmileIcon } from '@heroicons/react/24/outline';

interface PostComposerProps {
  onPost: (content: string, media: Array<{
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
    filename: string;
    mimeType: string;
  }>) => void;
}

export function PostComposer({ onPost }: PostComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePost = async () => {
    if ((!content.trim() && attachments.length === 0) || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Upload attachments to Firebase Storage
      const uploadedMedia = await Promise.all(
        attachments.map(async (file) => {
          const storagePath = `posts/media/${Date.now()}_${file.name}`;
          const metadata = { 
            userId: user?.uid || 'anonymous',
            contentType: file.type,
            originalFilename: file.name,
            securityValidated: 'true'
          };
          const url = await uploadFile(file, storagePath, metadata);
          
          let mediaType: 'image' | 'video' | 'audio' | 'file' = 'file';
          if (file.type.startsWith('image/')) mediaType = 'image';
          else if (file.type.startsWith('video/')) mediaType = 'video';
          else if (file.type.startsWith('audio/')) mediaType = 'audio';
          
          return {
            type: mediaType,
            url,
            filename: file.name,
            mimeType: file.type
          };
        })
      );
      
      // Submit post with uploaded media
      onPost(content, uploadedMedia);
      
      // Reset form
      setContent('');
      setAttachments([]);
    } catch (error) {
      console.error('Error uploading attachments:', error);
      alert('Failed to upload attachments. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  if (!user) return null;

  return (
    <div className="card-shadow-hover p-6 mb-6">
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
            className="w-full min-h-[100px] resize-none text-lg placeholder:text-[#666666] bg-transparent border-none focus:ring-0 focus:outline-none"
          />
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {attachments.map((file, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden border border-[#e6e6e6]">
                  {file.type.startsWith('image/') && (
                    <div className="aspect-square relative">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="Attachment"
                        fill
                        className="object-cover"
                        unoptimized={true}
                        onError={(e) => {
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.src = "/images/placeholder.svg";
                        }}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setAttachments(attachments.filter((_, i) => i !== index));
                    }}
                    className="absolute top-2 right-2 bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs truncate px-2 py-1">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e6e6e6]">
            <div className="flex gap-2">
              <label className="btn-outline flex items-center gap-2 cursor-pointer">
                <PhotoIcon className="w-5 h-5" />
                <span>Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <button
              onClick={handlePost}
              disabled={!content.trim() && attachments.length === 0}
              className={`btn-primary ${(!content.trim() && attachments.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Share Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 