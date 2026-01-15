// src/components/modals/UserProfileModal.tsx

import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import UserProfileHeader from '../profile/UserProfileHeader';
import UserProfilePosts from '../profile/Userprofileposts';
import { Card } from '../ui/card';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  createdAt: string;
}

interface UserProfileModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ User profile loaded:', data);
      
      setUser(data);
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const handleFollowChange = () => {
    // Refresh profile data sau khi follow/unfollow
    fetchUserProfile();
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-md"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-lg font-medium mt-4">Loading profile...</p>
            </div>
          ) : error || !user ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-red-500">Error loading profile</p>
              <p className="text-sm mt-2 text-gray-600">{error || 'User not found'}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* User Profile Header */}
              <UserProfileHeader user={user} onFollowChange={handleFollowChange} />

              {/* User Posts Grid */}
              <div className="mt-8">
                <UserProfilePosts userId={user.id} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}