"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { usePosts } from "@/lib/contexts/PostsContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import dynamic from 'next/dynamic';
import { CategoryPill } from '@/components/ui/CategoryPill';

// Dynamically import RichTextEditor with SSR disabled
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor').then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="min-h-[150px] bg-transparent">Loading editor...</div>
});

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { getPost, editPost } = usePosts();
  const { user } = useAuth();
  
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const postData = await getPost(postId);
        
        if (!postData) {
          setError("Post not found");
          router.push('/');
          return;
        }
        
        // Check if the user is the author of the post
        if (!user || (postData.author.name !== user.displayName && postData.author.name !== "Anonymous User")) {
          setError("You can only edit your own posts");
          router.push('/');
          return;
        }
        
        setContent(postData.content);
        setSelectedCategories(postData.category.split(', '));
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [postId, getPost, router, user]);

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
      setIsSaving(true);
      setError(null);
      
      await editPost(postId, {
        content,
        category: selectedCategories.join(', ')
      });
      
      router.push(`/post/${postId}`);
    } catch (err) {
      console.error("Error updating post:", err);
      setError("Failed to update post");
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-gray-200 rounded mx-auto mb-4"></div>
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white backdrop-blur-sm border-b border-black">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              
              <h1 className="text-lg font-semibold">
                Edit Post
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-black mb-2">
              What did you learn?
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

          <div className="flex justify-end pt-4 border-t border-[#e6e6e6]">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isSaving}
                className={`btn-primary ${
                  !isValid || isSaving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
} 