import { useState, useRef, ChangeEvent } from 'react';
import { PhotoIcon, VideoCameraIcon, MusicalNoteIcon, PaperClipIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Post } from '@/lib/contexts/PostsContext';

// Dynamically import RichTextEditor with SSR disabled
const RichTextEditor = dynamic(() => import('./RichTextEditor').then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="border rounded-lg p-4 min-h-[200px] bg-gray-50">Loading editor...</div>
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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoriesContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      title, 
      content, 
      category: selectedCategories.join(', '), // Join multiple categories
      isPrivate, 
      media 
    });
    setTitle('');
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
      <div>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What did you learn today?"
          required
        />
      </div>

      <div ref={categoriesContainerRef} className="space-y-2">
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

      <div>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Share what you learned..."
        />
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {media.map((item, index) => (
            <div key={index} className="relative group">
              {item.type === 'image' && (
                <div className="relative h-40 w-full rounded-lg overflow-hidden">
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {item.type === 'video' && (
                <video src={item.url} className="h-40 w-full rounded-lg object-cover" />
              )}
              {item.type === 'audio' && (
                <div className="h-40 w-full rounded-lg bg-gray-100 flex items-center justify-center">
                  <MusicalNoteIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {item.type === 'file' && (
                <div className="h-40 w-full rounded-lg bg-gray-100 flex items-center justify-center">
                  <PaperClipIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    </form>
  );
}; 