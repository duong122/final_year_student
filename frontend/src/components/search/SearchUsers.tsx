import { useState } from 'react';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface SearchUser {
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SearchUsers() {
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/api/users/search?keyword=${encodeURIComponent(keyword)}&page=0&size=20`,
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
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Search results:', data);
      
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'NA';
    const parts = fullName.split(' ');
    return (
      parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')
    ).toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Bar */}
      <Card className="p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search users by name or username..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="px-6 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </Card>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {!loading && hasSearched && users.length === 0 && (
        <Card className="p-12 text-center">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">No users found</p>
          <p className="text-sm text-gray-500 mt-2">Try searching with a different keyword</p>
        </Card>
      )}

      {!loading && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <Card
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatarUrl || ''} alt={user.fullName} />
                  <AvatarFallback className="bg-gradient-1 text-white text-lg">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  {user.bio && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {user.bio}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-center">
                  <div>
                    <p className="font-semibold text-gray-900">{user.postsCount}</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.followersCount}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.followingCount}</p>
                    <p className="text-xs text-gray-500">Following</p>
                  </div>
                </div>

                {/* Follow Status Badge */}
                {user.isFollowing && (
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    Following
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State - Before Search */}
      {!hasSearched && (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700">Search for users</p>
          <p className="text-sm text-gray-500 mt-2">
            Enter a name or username to find people
          </p>
        </Card>
      )}
    </div>
  );
}