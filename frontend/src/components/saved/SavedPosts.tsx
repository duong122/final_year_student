// src/components/profile/SavedPosts.tsx

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import CommentModal from '../feed/CommentModal';
import type { Post } from '../../types/post'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ SavedPost response từ API
interface SavedPostResponse {
  id: number;
  userId: number;
  username: string;
  userFullName: string;
  userAvatarUrl: string | null;
  caption: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
  isSaved: boolean;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]); // ✅ Dùng Post type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/saved-posts?page=0&size=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // ✅ Transform SavedPostResponse → Post
        const transformedPosts: Post[] = data.data.content.map((apiPost: SavedPostResponse) => ({
          id: apiPost.id,
          userId: apiPost.userId,
          username: apiPost.username,
          userFullName: apiPost.userFullName,
          userAvatarUrl: apiPost.userAvatarUrl,
          caption: apiPost.caption,
          imageUrl: apiPost.imageUrl,
          likeCount: apiPost.likeCount,
          commentCount: apiPost.commentCount,
          isSaved: true, // Always true for saved posts
          isLikedByCurrentUser: apiPost.isLikedByCurrentUser,
          createdAt: apiPost.createdAt,
          updatedAt: apiPost.updatedAt,
        }));

        setSavedPosts(transformedPosts);
        console.log('✅ Saved posts loaded:', transformedPosts.length);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('❌ Error loading saved posts:', err);
      setError('Failed to load saved posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  // ✅ Callback từ CommentModal khi comment count thay đổi
  const handleCommentCountUpdate = (newCount: number) => {
    if (selectedPost) {
      // Update comment count trong saved posts list
      setSavedPosts(prev => 
        prev.map(p => 
          p.id === selectedPost.id 
            ? { ...p, commentCount: newCount } 
            : p
        )
      );

      // Update selected post
      setSelectedPost(prev => prev ? { ...prev, commentCount: newCount } : null);
    }
  };

  // ✅ Handle khi post được unsave từ modal
  const handleUnsaveFromModal = (postId: number) => {
    console.log('🗑️ Removing post from saved list:', postId);
    
    // Remove from list
    setSavedPosts(prev => prev.filter(p => p.id !== postId));
    
    // Close modal
    handleCloseModal();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={fetchSavedPosts}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">No saved posts yet</p>
        <p className="text-sm mt-2">Save posts to see them here</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid 3 cột, gap nhỏ giống Instagram */}
      <div className="grid grid-cols-3 gap-1">
        {savedPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post)}
            className="relative aspect-square cursor-pointer group overflow-hidden bg-gray-100"
          >
            {/* Image */}
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Hover Overlay - Hiện likes & comments */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-8">
              {/* Likes */}
              <div className="flex items-center gap-2 text-white font-semibold">
                <Heart className="w-6 h-6 fill-white" />
                <span className="text-lg">{post.likeCount || 0}</span>
              </div>
              
              {/* Comments */}
              <div className="flex items-center gap-2 text-white font-semibold">
                <MessageCircle className="w-6 h-6 fill-white" />
                <span className="text-lg">{post.commentCount || 0}</span>
              </div>
            </div>

            {/* Bookmark indicator */}
            <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Bookmark className="w-4 h-4 fill-black text-black" />
            </div>
          </div>
        ))}
      </div>

      {/* Comment Modal */}
      {selectedPost && (
        <CommentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          post={selectedPost}
          onCommentCountUpdate={handleCommentCountUpdate}
        />
      )}
    </>
  );
}