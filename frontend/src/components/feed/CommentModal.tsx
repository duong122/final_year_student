// src/components/feed/CommentModal.tsx

import ReactDOM from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, MoreHorizontal, Smile, MessageCircle, Trash2, Edit2, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useFeedStore } from '../../stores/feedStore';
import { useChatStore } from '../../stores/chatStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Comment {
  id: number;
  postId: number;
  content: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
  isLikedByCurrentUser?: boolean;
}

// ✅ Dùng chung interface Post với FeedItem
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

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post; // ✅ Dùng interface Post mới
  onCommentCountUpdate?: (newCount: number) => void;
}

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffWeeks < 4) return `${diffWeeks}w`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

export default function CommentModal({ 
  isOpen, 
  onClose, 
  post,
  onCommentCountUpdate,
}: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMenuForComment, setShowMenuForComment] = useState<number | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // ✅ Local state cho bookmark
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [isSaving, setIsSaving] = useState(false);
  
  // ✅ Local state cho like
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  
  const currentUser = useChatStore(state => state.currentUser);
  const { createComment, getComments, updateComment, deleteComment } = useFeedStore();

  // Sync với post prop
  useEffect(() => {
    setIsSaved(post.isSaved);
    setIsLiked(post.isLikedByCurrentUser);
    setLikeCount(post.likeCount);
  }, [post.isSaved, post.isLikedByCurrentUser, post.likeCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenuForComment(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadComments();
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  }, [isOpen, post.id]);

  useEffect(() => {
    if (editingCommentId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingCommentId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const result = await getComments(post.id.toString());

      let commentsArray: Comment[] = [];
      
      if (result.success && result.data) {
        if (result.data.content && Array.isArray(result.data.content)) {
          commentsArray = result.data.content;
        } else if (Array.isArray(result.data)) {
          commentsArray = result.data;
        }
      } else if (Array.isArray(result)) {
        commentsArray = result;
      }

      setComments(commentsArray);
      
      if (onCommentCountUpdate) {
        onCommentCountUpdate(commentsArray.length);
      }
      
    } catch (error) {
      console.error('❌ Error loading comments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const result = await createComment(post.id.toString(), newComment.trim());

      if (result.success && result.data) {
        setComments(prev => [result.data, ...prev]);
        
        if (onCommentCountUpdate) {
          onCommentCountUpdate(comments.length + 1);
        }
      } else {
        await loadComments();
      }
      
      setNewComment('');
      
    } catch (error) {
      console.error('❌ Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Save/Unsave post - GIỐNG FeedItem
  const handleSavePost = async () => {
    if (isSaving) return;

    const wasSaved = isSaved;

    setIsSaved(!isSaved);
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
      setIsSaved(wasSaved);
      alert('Failed to update save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Like/Unlike post - GIỐNG FeedItem
  const handleLikePost = async () => {
    if (isLiking) return;

    const wasLiked = isLiked;
    const previousLikes = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsLiking(true);

    try {
      const token = localStorage.getItem('authToken');
      const url = `${API_BASE_URL}/api/posts/${post.id}/likes`;
      const method = wasLiked ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like/unlike post');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(wasLiked);
      setLikeCount(previousLikes);
      alert('Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setShowMenuForComment(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editContent.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const result = await updateComment(commentId, editContent.trim());

      if (result.success && result.data) {
        setComments(prev =>
          prev.map(c => c.id === commentId ? result.data : c)
        );
      }
      
      setEditingCommentId(null);
      setEditContent('');
    } catch (error) {
      console.error('❌ Error updating comment:', error);
      alert('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      if (onCommentCountUpdate) {
        onCommentCountUpdate(comments.length - 1);
      }
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId: number) => {
    console.log('Like comment:', commentId);
  };

  const toggleMenu = (commentId: number) => {
    setShowMenuForComment(prev => prev === commentId ? null : commentId);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-2xl flex overflow-hidden">
        {/* Left side - Image */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt="Post"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-white text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No image</p>
            </div>
          )}
        </div>

        {/* Right side - Comments */}
        <div className="w-[400px] flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.userAvatarUrl || ''} alt={post.username} />
                <AvatarFallback className="bg-gradient-1 text-white">
                  {post.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{post.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={post.userAvatarUrl || ''} alt={post.username} />
                  <AvatarFallback className="bg-gradient-1 text-white text-xs">
                    {post.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold mr-2">{post.username}</span>
                    <span className="text-gray-700">{post.caption}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{getTimeAgo(post.createdAt)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1">Be the first to comment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const isOwner = currentUser?.id === comment.user.id;
                  
                  return (
                    <div key={comment.id} className="group">
                      {editingCommentId === comment.id ? (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start gap-3 mb-2">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={comment.user.avatarUrl} alt={comment.user.username} />
                              <AvatarFallback className="bg-gradient-1 text-white text-xs">
                                {comment.user.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 mb-2">
                                {comment.user.username}
                              </p>
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Edit your comment..."
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-end gap-2 mt-3">
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(comment.id)}
                              disabled={!editContent.trim()}
                              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 relative">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={comment.user.avatarUrl} alt={comment.user.username} />
                            <AvatarFallback className="bg-gradient-1 text-white text-xs">
                              {comment.user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="text-sm break-words">
                              <span className="font-semibold mr-2">{comment.user.username}</span>
                              <span className="text-gray-700">{comment.content}</span>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(comment.createdAt)}
                              </span>
                              
                              {(comment.likeCount ?? 0) > 0 && (
                                <span className="text-xs text-gray-400 font-semibold">
                                  {comment.likeCount} {comment.likeCount === 1 ? 'like' : 'likes'}
                                </span>
                              )}
                              
                              <button className="text-xs text-gray-400 font-semibold hover:text-gray-600 transition-colors">
                                Reply
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Heart
                                className={cn(
                                  'w-4 h-4',
                                  comment.isLikedByCurrentUser
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-gray-400 hover:text-gray-600'
                                )}
                              />
                            </button>

                            {isOwner && (
                              <div className="relative">
                                <button
                                  onClick={() => toggleMenu(comment.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
                                >
                                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                </button>

                                {showMenuForComment === comment.id && (
                                  <div 
                                    ref={menuRef}
                                    className="absolute right-0 top-8 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                                  >
                                    <button
                                      onClick={() => handleStartEdit(comment)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      Edit comment
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete comment
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions & Stats */}
          <div className="border-t border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleLikePost}
                  disabled={isLiking}
                  className="hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <Heart
                    className={cn(
                      'w-6 h-6 transition-colors',
                      isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
                    )}
                  />
                </button>
                <button className="hover:text-gray-600 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="hover:text-gray-600 transition-colors">
                  <Send className="w-6 h-6" />
                </button>
              </div>
              
              {/* ✅ BOOKMARK BUTTON - GIỐNG FeedItem */}
              <button 
                onClick={handleSavePost}
                disabled={isSaving}
                className="hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <Bookmark
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isSaved ? 'fill-foreground text-foreground' : 'text-foreground'
                  )}
                />
              </button>
            </div>
            <p className="text-sm font-semibold mb-1">
              {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
            </p>
            <p className="text-xs text-gray-400">{getTimeAgo(post.createdAt)}</p>
          </div>

          {/* Comment Input */}
          <form
            onSubmit={handleSubmitComment}
            className="border-t border-gray-200 px-4 py-3 flex items-center gap-3"
          >
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Smile className="w-6 h-6" />
            </button>
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 outline-none text-sm"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="text-blue-500 font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:text-blue-600 transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}