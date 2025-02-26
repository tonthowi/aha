import { useState, useRef, ChangeEvent } from 'react';
import { PhotoIcon, VideoCameraIcon, MusicalNoteIcon, PaperClipIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Post } from '@/lib/contexts/PostsContext';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    onSubmit({ 
      content, 
      category: selectedCategories.join(', '),
      isPrivate, 
      media 
    });
    
    setContent('');
    setSelectedCategories([]);
    setIsPrivate(false);
    setMedia([]);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="min-h-[150px]">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="What did you learn today?"
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, showAllCategories ? undefined : 12).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategories.includes(category)
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
          {!showAllCategories && categories.length > 12 && (
            <button
              type="button"
              onClick={() => setShowAllCategories(true)}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              +{categories.length - 12}
            </button>
          )}
        </div>
        {selectedCategories.length >= 5 && (
          <p className="text-sm text-yellow-600">Maximum 5 categories allowed</p>
        )}
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <div className={`grid gap-2 mt-4 ${
          media.length === 1 ? 'grid-cols-1' :
          media.length === 2 ? 'grid-cols-2' :
          media.length === 3 ? 'grid-cols-2' :
          'grid-cols-2'
        }`}>
          {media.map((item, index) => (
            <div 
              key={index} 
              className={`relative ${
                media.length === 1 ? 'aspect-[16/9]' :
                media.length === 2 ? 'aspect-square' :
                index === 0 && media.length === 3 ? 'aspect-square col-span-2' :
                'aspect-square'
              }`}
            >
              {item.type === 'image' && (
                <div className="relative h-full w-full rounded-2xl overflow-hidden">
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {item.type === 'video' && (
                <video src={item.url} className="h-full w-full rounded-2xl object-cover" />
              )}
              {item.type === 'audio' && (
                <div className="h-full w-full rounded-2xl bg-gray-100 flex items-center justify-center">
                  <MusicalNoteIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {item.type === 'file' && (
                <div className="h-full w-full rounded-2xl bg-gray-100 flex items-center justify-center">
                  <PaperClipIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'image')}
            multiple
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <PhotoIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <VideoCameraIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <MusicalNoteIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <PaperClipIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`p-2 rounded-full transition-colors ${
              isPrivate 
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                : 'text-green-500 bg-green-50 hover:bg-green-100'
            }`}
          >
            {isPrivate ? (
              <LockClosedIcon className="w-6 h-6" />
            ) : (
              <GlobeAltIcon className="w-6 h-6" />
            )}
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              isValid
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-blue-200 text-white cursor-not-allowed'
            }`}
          >
            Post
          </button>
        </div>
      </div>
    </form>
  );
}; 