import { useState, useRef } from 'react';
import { HeartIcon, MessageCircleIcon, SendIcon, BookmarkIcon, MoreHorizontalIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import gsap from 'gsap';
import CommentModal from './CommentModal';
import { useFeedStore } from '../../stores/feedStore';

interface Post {
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

interface FeedItemProps {
  post: Post;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function FeedItem({ post: initialPost }: FeedItemProps) {
  const [post, setPost] = useState(initialPost);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const heartRef = useRef<HTMLButtonElement>(null);
  
  const { likePost, unlikePost } = useFeedStore();

  // ✅ Handle Like với safe guards
  const handleLike = async () => {
    if (isLiking) return;

    if (heartRef.current) {
      gsap.fromTo(
        heartRef.current,
        { scale: 1 },
        {
          scale: 1.2,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        }
      );
    }

    const wasLiked = post.isLikedByCurrentUser;
    const previousLikes = post.likeCount ?? 0;

    // ✅ Safe update với fallback
    setPost((prev) => {
      if (!prev) return initialPost;
      return {
        ...prev,
        isLikedByCurrentUser: !prev.isLikedByCurrentUser,
        likeCount: prev.isLikedByCurrentUser ? (prev.likeCount ?? 0) - 1 : (prev.likeCount ?? 0) + 1,
      };
    });

    setIsLiking(true);

    try {
      if (wasLiked) {
        await unlikePost(post.id.toString());
      } else {
        await likePost(post.id.toString());
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      
      // ✅ Safe revert
      setPost((prev) => {
        if (!prev) return initialPost;
        return {
          ...prev,
          isLikedByCurrentUser: wasLiked,
          likeCount: previousLikes,
        };
      });
      
      alert('Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  // ✅ Handle Save với safe guards
  const handleSave = async () => {
    if (isSaving) return;

    const wasSaved = post.isSaved ?? false;

    // ✅ Safe update
    setPost((prev) => {
      if (!prev) return initialPost;
      return {
        ...prev,
        isSaved: !prev.isSaved,
      };
    });

    setIsSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      
      if (wasSaved) {
        const response = await fetch(`${API_BASE_URL}/api/saved-posts/${post.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to unsave post');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/saved-posts/${post.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to save post');
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      
      // ✅ Safe revert
      setPost((prev) => {
        if (!prev) return initialPost;
        return {
          ...prev,
          isSaved: wasSaved,
        };
      });
      
      alert('Failed to update save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenComments = () => {
    setIsCommentModalOpen(true);
  };

  const handleCommentCountUpdate = (newCount: number) => {
    setPost((prev) => {
      if (!prev) return initialPost;
      return {
        ...prev,
        commentCount: newCount,
      };
    });
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (seconds < 60) return `${seconds}s`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
      return `${Math.floor(seconds / 86400)}d`;
    } catch (error) {
      return 'now';
    }
  };

  // ✅ Safe guards cho render
  if (!post) return null;

  return (
    <>
      <article className="bg-white border-b border-neutral-200 pb-4 mb-4">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.userAvatarUrl || ''} alt={post.username || 'User'} />
              <AvatarFallback className="bg-gradient-1 text-white text-xs">
                {post.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">
                {post.username || 'Unknown'}
              </span>
              <span className="text-neutral-500 text-sm">·</span>
              <span className="text-sm text-neutral-500">
                {getTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent">
            <MoreHorizontalIcon className="w-5 h-5" />
          </Button>
        </div>

        {post.imageUrl && (
          <div className="w-full">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="px-4 pt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              {/* Like Button */}
              <Button
                ref={heartRef}
                variant="ghost"
                size="icon"
                onClick={handleLike}
                disabled={isLiking}
                className="h-8 w-8 hover:bg-transparent p-0 disabled:opacity-50"
              >
                <HeartIcon 
                  className={cn(
                    "w-6 h-6 transition-colors",
                    post.isLikedByCurrentUser ? "fill-red-500 text-red-500" : "text-foreground"
                  )} 
                />
              </Button>

              {/* Comment Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenComments}
                className="h-8 w-8 hover:bg-transparent p-0"
              >
                <MessageCircleIcon className="w-6 h-6 text-foreground" />
              </Button>

              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent p-0">
                <SendIcon className="w-6 h-6 text-foreground" />
              </Button>
            </div>

            {/* Save Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 w-8 hover:bg-transparent p-0 disabled:opacity-50"
            >
              <BookmarkIcon 
                className={cn(
                  "w-6 h-6 transition-colors",
                  post.isSaved ? "fill-foreground text-foreground" : "text-foreground"
                )} 
              />
            </Button>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {(post.likeCount ?? 0).toLocaleString()} {(post.likeCount ?? 0) === 1 ? 'like' : 'likes'}
            </p>
            <p className="text-sm text-foreground">
              <span className="font-semibold mr-2">{post.username || 'Unknown'}</span>
              {post.caption || ''}
            </p>
            
            {(post.commentCount ?? 0) > 0 && (
              <button
                onClick={handleOpenComments}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                View all {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
              </button>
            )}
          </div>
        </div>
      </article>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        post={post}
        onCommentCountUpdate={handleCommentCountUpdate}
      />
    </>
  );
}