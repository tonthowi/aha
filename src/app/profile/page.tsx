'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-100">
      <main className="max-w-2xl mx-auto p-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          
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
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      // TODO: Implement update profile
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Save Changes
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
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive email updates about your activity</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200">
                <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h3 className="font-medium">Profile Visibility</h3>
                <p className="text-sm text-gray-500">Choose who can see your profile</p>
              </div>
              <select className="rounded-lg border-gray-300 text-sm">
                <option>Everyone</option>
                <option>Only me</option>
              </select>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
} 