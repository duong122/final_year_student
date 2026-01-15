import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserProfileHeaderProps {
  user: {
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
  };
  onFollowChange: () => void; // Callback để refresh data
}

export default function UserProfileHeader({ user, onFollowChange }: UserProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [followersCount, setFollowersCount] = useState(user.followersCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/api/users/${user.id}/follow`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to follow/unfollow: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Follow toggle result:', result);

      // Toggle local state
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

      // Callback để parent có thể refresh nếu cần
      onFollowChange();
    } catch (error) {
      console.error('❌ Error toggling follow:', error);
      alert('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'NA';
    const parts = fullName.split(' ');
    return (
      parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')
    ).toUpperCase();
  };

  return (
    <Card className="p-8 mb-8 bg-card text-card-foreground border-border">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Avatar */}
        <Avatar className="w-32 h-32">
          <AvatarImage
            src={user.avatarUrl}
            alt={`${user.fullName}'s profile picture`}
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              {user.fullName}
            </h1>
            <p className="text-sm text-gray-500">@{user.username}</p>
            
            {/* Follow Button */}
            <Button
              onClick={handleFollowToggle}
              disabled={isLoading}
              className={
                isFollowing
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            >
              {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center md:justify-start mb-4">
            <div>
              <p className="font-semibold text-foreground">
                {user.postsCount}
              </p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {followersCount}
              </p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {user.followingCount}
              </p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-foreground font-body">{user.bio}</p>
          )}
        </div>
      </div>
    </Card>
  );
}