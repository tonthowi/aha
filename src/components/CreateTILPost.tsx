import { useState, useRef, ChangeEvent } from 'react';
import { PhotoIcon, VideoCameraIcon, MusicalNoteIcon, PaperClipIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Post } from '@/lib/contexts/PostsContext';
import { uploadFile } from '@/lib/firebase/firebaseUtils';
import { useAuth } from '@/lib/hooks/useAuth';

// Dynamically import RichTextEditor with SSR disabled
const RichTextEditor = dynamic(() => import('./RichTextEditor').then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="min-h-[150px] bg-transparent">Loading editor...</div>
});

interface MediaAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  filename: string;
  mimeType: string;
}

interface CreateTILPostProps {
  onSubmit: (post: Omit<Post, 'id' | 'author' | 'createdAt' | 'likes' | 'comments' | 'bookmarks'>) => void;
}

export const CreateTILPost: React.FC<CreateTILPostProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const categories = [
    '💻 Programming',
    '🌐 Web Development',
    '📊 Data Science',
    '🚀 DevOps',
    '🎨 Design',
    '📱 Mobile Development',
    '🤖 Machine Learning',
    '☁️ Cloud Computing',
    '🔒 Security',
    '🗄️ Databases',
    '🎯 UI/UX',
    '🧪 Testing',
    '🏗️ Architecture',
    '✨ Best Practices',
    '🛠️ Tools',
    '🔮 Other'
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, category];
    });
  };

  // Check if content has at least 3 words
  const hasMinimumWords = (text: string) => {
    const words = text.trim().split(/\s+/);
    return words.length >= 3 && words[0] !== '';
  };

  const isValid = hasMinimumWords(content) && selectedCategories.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      // Upload media files to Firebase Storage if they are blob URLs
      const processedMedia = await Promise.all(
        media.map(async (item) => {
          // If the URL is a blob URL, we need to upload it to Firebase Storage
          if (item.url.startsWith('blob:')) {
            // Convert blob URL back to a file
            const response = await fetch(item.url);
            const blob = await response.blob();
            const file = new File([blob], item.filename, { type: item.mimeType });
            
            // Upload to Firebase Storage with user ID in metadata
            const storagePath = `posts/media/${Date.now()}_${item.filename}`;
            const metadata = { userId: user?.uid || 'anonymous' };
            const permanentUrl = await uploadFile(file, storagePath, metadata);
            
            return {
              ...item,
              url: permanentUrl
            };
          }
          
          // If it's not a blob URL, return as is
          return item;
        })
      );

      // Submit the post with processed media
      onSubmit({ 
        content, 
        category: selectedCategories.join(', '),
        isPrivate, 
        media: processedMedia 
      });
      
      // Clear form
      setContent('');
      setSelectedCategories([]);
      setIsPrivate(false);
      setMedia([]);
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media. Please try again.');
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: MediaAttachment['type']) => {
    const files = e.target.files;
    if (!files?.length) return;

    // In a real app, you would upload these files to a storage service
    // For now, we'll create object URLs for preview
    const newMedia = Array.from(files).map(file => ({
      type,
      url: URL.createObjectURL(file),
      filename: file.name,
      mimeType: file.type
    }));

    setMedia([...media, ...newMedia]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = [...media];
    URL.revokeObjectURL(newMedia[index].url);
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-black mb-2">
          What did you learn today?
        </label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Share your knowledge with the community..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {(showAllCategories ? categories : categories.slice(0, 6)).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`${
                selectedCategories.includes(category)
                  ? 'bg-black text-white'
                  : 'bg-[#f7f7f7] text-[#666666] hover:bg-[#e6e6e6]'
              } px-3 py-1 rounded-full text-sm font-medium transition-colors`}
            >
              {category}
            </button>
          ))}
          {categories.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-sm text-[#666666] hover:text-black underline transition-colors"
            >
              {showAllCategories ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Visibility
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setIsPrivate(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              !isPrivate
                ? 'border-black bg-black text-white'
                : 'border-[#e6e6e6] text-[#666666] hover:border-black hover:text-black'
            } transition-colors`}
          >
            <GlobeAltIcon className="w-5 h-5" />
            <span>Public</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPrivate(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              isPrivate
                ? 'border-black bg-black text-white'
                : 'border-[#e6e6e6] text-[#666666] hover:border-black hover:text-black'
            } transition-colors`}
          >
            <LockClosedIcon className="w-5 h-5" />
            <span>Private</span>
          </button>
        </div>
      </div>

      {media.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Attached Media
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {media.map((item, index) => (
              <div key={index} className="relative group rounded-xl overflow-hidden border border-[#e6e6e6]">
                {item.type === 'image' && (
                  <div className="aspect-square relative">
                    <Image
                      src={item.url}
                      alt={item.filename}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>
                )}
                {item.type === 'video' && (
                  <div className="aspect-square bg-[#f7f7f7] flex items-center justify-center">
                    <VideoCameraIcon className="w-8 h-8 text-[#666666]" />
                  </div>
                )}
                {item.type === 'audio' && (
                  <div className="aspect-square bg-[#f7f7f7] flex items-center justify-center">
                    <MusicalNoteIcon className="w-8 h-8 text-[#666666]" />
                  </div>
                )}
                {item.type === 'file' && (
                  <div className="aspect-square bg-[#f7f7f7] flex items-center justify-center">
                    <PaperClipIcon className="w-8 h-8 text-[#666666]" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs truncate px-2 py-1">
                  {item.filename}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFileUpload(e, 'image')}
          accept="image/*"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-outline flex items-center gap-2"
        >
          <PhotoIcon className="w-5 h-5" />
          <span>Add Image</span>
        </button>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#e6e6e6]">
        <button
          type="submit"
          disabled={!hasMinimumWords(content)}
          className={`btn-primary ${
            !hasMinimumWords(content) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Share Learning
        </button>
      </div>
    </form>
  );
}; 