import { useState, useEffect } from 'react';
import SuggestedUsers from '../../components/suggestions/SuggestedUsers';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';

interface CurrentUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function RightSidebar() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }
        
        const data: CurrentUser = await response.json();
        setCurrentUser(data);
      } catch (err) {
        console.error('Error fetching current user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-[320px] bg-white sticky top-0 h-screen overflow-y-auto">
      <div className="pt-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11">
              <AvatarImage src={currentUser?.avatarUrl || ''} alt="Your profile" />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                {loading ? '...' : currentUser ? getInitials(currentUser.fullName || currentUser.username) : 'YU'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {loading ? 'Loading...' : currentUser?.username || 'your_username'}
              </p>
              <p className="text-xs text-neutral-500">
                {loading ? '' : currentUser?.fullName || 'Your Name'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-semibold text-blue-500 hover:text-blue-600 hover:bg-transparent p-0 h-auto">
            Switch
          </Button>
        </div>
        
        {/* ✅ Pass currentUserId để SuggestedUsers filter */}
        <SuggestedUsers currentUserId={currentUser?.id} />
        
        <div className="mt-8 text-xs text-neutral-400 space-y-3">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <a href="#" className="hover:underline">About</a>
            <span>·</span>
            <a href="#" className="hover:underline">Help</a>
            <span>·</span>
            <a href="#" className="hover:underline">Press</a>
            <span>·</span>
            <a href="#" className="hover:underline">API</a>
            <span>·</span>
            <a href="#" className="hover:underline">Jobs</a>
            <span>·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:underline">Terms</a>
          </div>
          <p>© 2025 LINKLY FROM ICEBEAR</p>
        </div>
      </div>
    </aside>
  );
}