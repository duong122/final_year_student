import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  createdAt: string;
}

// ✅ Thêm interface cho props
interface SuggestedUsersProps {
  currentUserId?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ✅ Thêm props vào component
export default function SuggestedUsers({ currentUserId }: SuggestedUsersProps) {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_BASE_URL}/api/users/search?keyword=&page=0&size=20`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data: User[] = await response.json();
        
        // ✅ Filter ra current user
        const filteredUsers = currentUserId 
          ? data.filter(user => user.id !== currentUserId)
          : data;
        
        // Lấy ngẫu nhiên 5 users
        const shuffled = filteredUsers.sort(() => 0.5 - Math.random());
        const randomUsers = shuffled.slice(0, 5);
        
        setSuggestedUsers(randomUsers);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching suggested users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [currentUserId]); // ✅ Thêm dependency

  // ... rest of code giữ nguyên
  const handleFollow = async (userId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const user = suggestedUsers.find(u => u.id === userId);
      
      if (!user) return;
      
      const endpoint = `${API_BASE_URL}/api/users/${userId}/follow`;
      const method = user.isFollowing ? 'DELETE' : 'POST';
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to follow/unfollow user');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSuggestedUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId 
              ? { 
                  ...user, 
                  isFollowing: !user.isFollowing,
                  followersCount: user.isFollowing 
                    ? user.followersCount - 1 
                    : user.followersCount + 1
                } 
              : user
          )
        );
      }
    } catch (err) {
      console.error('Error following/unfollowing user:', err);
      alert('Failed to follow/unfollow user. Please try again.');
    }
  };

  const getSubtitle = (user: User) => {
    if (user.followersCount === 0) {
      return 'New to Instagram';
    } else if (user.followersCount === 1) {
      return `Followed by ${user.followersCount} user`;
    } else {
      return `Followed by ${user.followersCount} users`;
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-neutral-500">
        Loading suggestions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Failed to load suggestions
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-500">Suggested for you</h3>
        <Button variant="ghost" size="sm" className="text-xs font-semibold text-foreground hover:text-neutral-500 hover:bg-transparent p-0 h-auto">
          See All
        </Button>
      </div>
      
      <div className="space-y-3">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11">
                <AvatarImage src={user.avatarUrl || ''} alt={user.username} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-foreground">{user.username}</p>
                <p className="text-xs text-neutral-500">{getSubtitle(user)}</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 hover:bg-transparent p-0 h-auto"
              onClick={() => handleFollow(user.id)}
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}