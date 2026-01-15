// src/components/profile/ProfilePosts.tsx

import { useState, useEffect } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { useFeedStore } from '../../stores/feedStore';
import { useChatStore } from '../../stores/chatStore';
import CommentModal from '../feed/CommentModal';
import type { Post } from '../../types/post'; 

export default function ProfilePosts() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localPosts, setLocalPosts] = useState<Post[]>([]); 
  
  const currentUser = useChatStore(state => state.currentUser);
  const posts = useFeedStore(state => state.posts);
  const loading = useFeedStore(state => state.loading);
  const { getUserPosts } = useFeedStore();

  // ✅ Sync posts từ store vào local state
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (currentUser) {
        try {
          await getUserPosts(currentUser.id, 0, 100);
        } catch (error) {
          console.error('❌ Error loading user posts:', error);
        }
      }
    };

    fetchUserPosts();
  }, [currentUser, getUserPosts]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  // ✅ Callback để update comment count
  const handleCommentCountUpdate = (newCount: number) => {
    if (selectedPost) {
      // Update local posts
      setLocalPosts(prev =>
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Please login to view posts</p>
      </div>
    );
  }

  if (localPosts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No posts yet</p>
        <p className="text-sm mt-2">Share your first photo to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid 3 cột, gap nhỏ giống Instagram */}
      <div className="grid grid-cols-3 gap-1">
        {localPosts.map((post) => (
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