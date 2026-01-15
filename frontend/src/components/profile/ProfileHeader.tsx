import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import EditProfileDialog from './EditProfileDialog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/users/me`;

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

type UserState = UserProfile | null;

export default function ProfileHeader() {
  const [user, setUser] = useState<UserState>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      console.log('Fetch profile response: ', response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UserProfile = await response.json();
      setUser(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Failed to fetch user profile:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleUpdateSuccess = () => {
    // Refresh profile data sau khi update thành công
    fetchUserProfile();
  };

  if (isLoading) {
    return (
      <Card className="p-8 mb-8 bg-card text-card-foreground border-border text-center">
        <p className="text-lg font-medium">Đang tải dữ liệu...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 mb-8 bg-card text-card-foreground border-border text-center text-red-500">
        <p className="text-lg font-medium">Lỗi khi tải hồ sơ: {error}</p>
        <p className="text-sm">Vui lòng kiểm tra API server.</p>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (fullName: string) => {
    if (!fullName) return 'NA';
    const parts = fullName.split(' ');
    return (
      parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')
    ).toUpperCase();
  };

  return (
    <>
      <Card className="p-8 mb-8 bg-card text-card-foreground border-border">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <Avatar className="w-32 h-32">
            <AvatarImage
              src={user.avatarUrl}
              alt={`${user.fullName}'s profile picture`}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold text-foreground">
                {user.fullName}
              </h1>
              <Button
                onClick={handleEditClick}
                className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground font-normal"
              >
                Edit Profile
              </Button>
            </div>

            <div className="flex gap-8 justify-center md:justify-start mb-4">
              <div>
                <p className="font-semibold text-foreground">
                  {user.postsCount}
                </p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {user.followersCount}
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

            <p className="text-foreground font-body">{user.bio}</p>
          </div>
        </div>
      </Card>

      {/* Edit Profile Dialog */}
      {user && (
        <EditProfileDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseDialog}
          currentUser={{
            fullName: user.fullName,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
          }}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}