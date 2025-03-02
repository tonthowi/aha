'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { updateProfile } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profileVisibility, setProfileVisibility] = useState('everyone');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user, loading, router]);

  const handleSaveChanges = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Update display name in Firebase Auth
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Here you would also save profile visibility to your database
      // For now we're just updating the local state
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto p-4 flex items-center">
          <button
            onClick={() => router.push('/')}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back to homepage"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold ml-2">Profile</h1>
        </div>
      </header>
      
      <main className="max-w-2xl mx-auto p-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <Image
                  src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt="Profile picture"
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-medium">{user.displayName}</p>
                  )}
                </div>
                
                <div className="mt-4 space-y-1">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user.displayName || '');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-blue-500 hover:text-blue-600"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h3 className="font-medium">Profile Visibility</h3>
                <p className="text-sm text-gray-500">Choose who can see your profile</p>
              </div>
              <select 
                className="rounded-lg border-gray-300 text-sm"
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="followers">Followers Only</option>
                <option value="private">Only me</option>
              </select>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
} 