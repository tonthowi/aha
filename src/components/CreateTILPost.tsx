import { useState, useRef, ChangeEvent } from 'react';
import { PhotoIcon, VideoCameraIcon, MusicalNoteIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Post } from '@/lib/contexts/PostsContext';
import { uploadFile } from '@/lib/firebase/firebaseUtils';
import { useAuth } from '@/lib/hooks/useAuth';
import { CategoryPill } from '@/components/ui/CategoryPill';
import toast from 'react-hot-toast';
import { validateFile, generateSecureFilename, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/utils/fileUtils';

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
  file?: File;
}

interface CreateTILPostProps {
  onSubmit: (post: Omit<Post, 'id' | 'author' | 'createdAt' | 'likes' | 'comments' | 'bookmarks'>) => void;
}

export const CreateTILPost: React.FC<CreateTILPostProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
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
    
    // Validate form
    const isValid = content.trim().length > 0 && selectedCategories.length > 0;
    
    if (!isValid) {
      return;
    }
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('You must be signed in to share a post');
      }
      
      // Use server-side API for secure validation and upload
      const formData = new FormData();
      
      // Add content and category
      formData.append('content', content);
      formData.append('category', selectedCategories.join(', '));
      
      // Add media files
      for (const item of media) {
        if (item.file) {
          formData.append('media', item.file);
        }
      }
      
      // Process media attachments if any
      let processedMedia: MediaAttachment[] = [];
      
      if (media.length > 0) {
        // Process each media item
        for (const item of media) {
          try {
            if (!item.file) {
              console.error("Media item missing file property:", item);
              toast.error("Error processing media. Please try again.");
              setIsSubmitting(false);
              return;
            }
            
            // Upload to Firebase Storage and get permanent URL
            const permanentUrl = await uploadMediaToStorage(item.file, item.filename);
            
            // Add to processed media
            processedMedia.push({
              type: item.type,
              url: permanentUrl,
              filename: item.filename,
              mimeType: item.file?.type || '',
            });
          } catch (error) {
            console.error("Failed to upload media:", error);
            // Handle upload error
            setSubmissionError("Failed to upload media. Please try again.");
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      // Prepare post data
      const postData = {
        content,
        category: selectedCategories.join(', '),
        media: processedMedia.length > 0 ? processedMedia : [],
      };
      
      // Submit post data
      await onSubmit(postData);
      
      // Reset form on success
      resetForm();
      
    } catch (error) {
      console.error("Error sharing post:", error);
      setSubmissionError(error instanceof Error ? error.message : "Failed to share your learning. Please try again.");
      toast.error(error instanceof Error ? error.message : "Failed to share your learning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareClick = () => {
    if (isValid && !isSubmitting) {
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: MediaAttachment['type']) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each file with validation
    const validFiles: File[] = [];
    const invalidFiles: { file: File; error: string }[] = [];

    Array.from(files).forEach((file) => {
      const validation = validateFile(file, {
        maxSize: MAX_FILE_SIZE,
        allowedTypes: ALLOWED_IMAGE_TYPES,
      });

      if (validation.valid) {
        validFiles.push(file);
      } else if (validation.error) {
        invalidFiles.push({ file, error: validation.error });
      }
    });

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ file, error }) => {
        toast.error(`${file.name}: ${error}`);
      });
    }

    // Process valid files
    if (validFiles.length > 0) {
      const newMedia = validFiles.map((file) => ({
        type,
        url: URL.createObjectURL(file),
        filename: file.name,
        mimeType: file.type,
        file: file
      }));

      setMedia([...media, ...newMedia]);
    }
    
    // Reset the file input
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

  const resetForm = () => {
    setContent('');
    setSelectedCategories([]);
    setMedia([]);
    setSubmissionError(null);
  };

  // Update uploadMediaToStorage function
  const uploadMediaToStorage = async (file: File | undefined, filename: string): Promise<string> => {
    // If we have a file, upload it to Firebase Storage
    if (file) {
      try {
        // Validate file again before upload (server-side validation)
        const validation = validateFile(file, {
          maxSize: MAX_FILE_SIZE,
          allowedTypes: ALLOWED_IMAGE_TYPES,
        });
        
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid file');
        }
        
        // Generate a secure filename instead of using the original
        const secureFilename = generateSecureFilename(filename);
        
        // Handle SVG files specifically
        let contentType = file.type;
        if (file.type === 'image/svg+xml') {
          // Ensure content type is correctly set for SVG files
          contentType = 'image/svg+xml';
        }
        
        // Upload to Firebase Storage with user ID in metadata
        const storagePath = `posts/media/${secureFilename}`;
        const metadata = { 
          userId: user?.uid || 'anonymous',
          contentType: contentType,
          originalFilename: filename, // Store original filename as metadata
          securityValidated: 'true' // Mark as validated for security
        };
        
        return await uploadFile(file, storagePath, metadata);
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to upload media file");
      }
    }
    throw new Error("No file provided for upload");
  };

  return (
    <div className="space-y-6">
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
          {(showAllCategories ? categories : categories.slice(0, 6)).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className="flex-shrink-0"
            >
              <CategoryPill 
                category={cat} 
                className={selectedCategories.includes(cat) ? "!bg-black !text-white" : ""}
              />
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
          accept={ALLOWED_IMAGE_TYPES.join(',')}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-outline flex items-center gap-2"
        >
          <PhotoIcon className="w-5 h-5" />
          <span>Add Image (Max 2MB)</span>
        </button>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#e6e6e6]">
        <button
          type="button"
          disabled={!isValid || isSubmitting}
          className={`btn-primary ${
            !isValid || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleShareClick}
        >
          {isSubmitting ? 'Sharing...' : 'Share Learning'}
        </button>
      </div>
    </div>
  );
}; 