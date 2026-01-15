// feedStore.ts
import { create } from 'zustand';
import type { Post } from '../types/post' // ✅ Import shared type

// ❌ XÓA interface Post local
// ❌ XÓA interface ApiPost (đổi tên thành ApiPost để tránh conflict)

interface ApiPostResponse {
  id: number;
  userId: number;
  username: string;
  userFullName: string;
  userAvatarUrl: string;
  caption: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
  isSaved: boolean; // ✅ Thêm field này
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeedState {
  posts: Post[]; // ✅ Dùng shared Post type
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  currentUser: CurrentUser | null;
  fetchFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadPosts: (page?: number, size?: number) => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  createPost: (image: File, caption: string) => Promise<void>;
  getUserPosts: (userId: number, page?: number, size?: number) => Promise<void>;
  
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  getLikeStatus: (postId: string) => Promise<{ isLiked: boolean; likeCount: number }>;
  
  createComment: (postId: string, content: string) => Promise<any>;
  getComments: (postId: string, page?: number, size?: number) => Promise<any>;
  updateComment: (commentId: number, content: string) => Promise<any>;
  deleteComment: (commentId: number) => Promise<void>;
  getCommentCount: (postId: string) => Promise<number>;
}

interface CurrentUser {
  id: number;
  username: string;
  fullName: string;
  avatarUrl: string;
  email: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Đơn giản hóa transform - chỉ cần map fields
const transformApiPost = (apiPost: ApiPostResponse): Post => ({
  id: apiPost.id, // ✅ Giữ nguyên số
  userId: apiPost.userId,
  username: apiPost.username,
  userFullName: apiPost.userFullName,
  userAvatarUrl: apiPost.userAvatarUrl,
  caption: apiPost.caption,
  imageUrl: apiPost.imageUrl.startsWith('http') 
    ? apiPost.imageUrl 
    : `${API_BASE_URL}${apiPost.imageUrl}`,
  likeCount: apiPost.likeCount,
  commentCount: apiPost.commentCount,
  isSaved: apiPost.isSaved, // ✅ Từ API
  isLikedByCurrentUser: apiPost.isLikedByCurrentUser,
  createdAt: apiPost.createdAt,
  updatedAt: apiPost.updatedAt,
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('❌ No authentication token found in localStorage');
  }
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  hasMore: true,
  currentUser: null,

  getUserPosts: async (userId: number, page = 0, size = 10) => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const headers = getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/posts/user/${userId}?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers,
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const transformedPosts = result.data.content.map(transformApiPost);

        set({
          posts: transformedPosts,
          currentPage: result.data.pageNumber,
          totalPages: result.data.totalPages,
          hasMore: !result.data.last,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error in getUserPosts:', error);
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false });
    }
  },

  fetchFeed: async () => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/posts/feed?page=0&size=10`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please login again.');
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const transformedPosts = result.data.content.map(transformApiPost);
        
        set({
          posts: transformedPosts,
          currentPage: result.data.pageNumber,
          totalPages: result.data.totalPages,
          hasMore: !result.data.last,
          loading: false,
        });
      } else {
        throw new Error(result.message || 'Failed to fetch feed');
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  loadMore: async () => {
    const { loading, hasMore, currentPage, posts } = get();
    if (loading || !hasMore) return;

    set({ loading: true, error: null });

    try {
      const nextPage = currentPage + 1;
      const response = await fetch(
        `${API_BASE_URL}/api/posts/feed?page=${nextPage}&size=10`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Load more error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const transformedPosts = result.data.content.map(transformApiPost);
        
        set({
          posts: [...posts, ...transformedPosts],
          currentPage: result.data.pageNumber,
          totalPages: result.data.totalPages,
          hasMore: !result.data.last,
          loading: false,
        });
      } else {
        throw new Error(result.message || 'Failed to load more posts');
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  loadPosts: async (page = 0, size = 10) => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(
        `${API_BASE_URL}/api/posts/feed?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers,
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ loadPosts error:', errorText);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please login again.');
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const transformedPosts = result.data.content.map(transformApiPost);
        
        set({
          posts: transformedPosts,
          currentPage: result.data.pageNumber,
          totalPages: result.data.totalPages,
          hasMore: !result.data.last,
          loading: false,
        });
      } else {
        throw new Error(result.message || 'Failed to load posts');
      }
    } catch (error) {
      console.error('Error in loadPosts:', error);
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  loadCurrentUser: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('⚠️ No token found, skipping loadCurrentUser');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('❌ Failed to load current user');
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        set({
          currentUser: {
            id: result.data.id,
            username: result.data.username,
            fullName: result.data.fullName,
            avatarUrl: result.data.avatarUrl,
            email: result.data.email,
          },
        });
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  },

  createPost: async (image: File, caption: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);

      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create post error:', errorText);
        throw new Error(`Failed to create post: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Post created successfully:', result);

      await get().loadPosts(0, 10);

      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  likePost: async (postId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/likes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to like post: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Post liked:', result);

      // ✅ Update với Post type mới
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === Number(postId)
            ? { ...post, isLikedByCurrentUser: true, likeCount: post.likeCount + 1 }
            : post
        ),
      }));

      return result;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  unlikePost: async (postId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/likes`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to unlike post: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Post unliked:', result);

      // ✅ Update với Post type mới
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === Number(postId)
            ? { ...post, isLikedByCurrentUser: false, likeCount: Math.max(0, post.likeCount - 1) }
            : post
        ),
      }));

      return result;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  },

  getLikeStatus: async (postId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/likes/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to get like status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          isLiked: result.data.isLiked,
          likeCount: result.data.likeCount,
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error getting like status:', error);
      throw error;
    }
  },

  createComment: async (postId: string, content: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to create comment: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Comment created:', result);

      // ✅ Update với Post type mới
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === Number(postId)
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        ),
      }));

      return result;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  getComments: async (postId: string, page = 0, size = 20) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments?page=${page}&size=${size}`,
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
        throw new Error(`Failed to get comments: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Comments loaded:', result);

      return result;
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  },

  updateComment: async (commentId: number, content: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to update comment: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Comment updated:', result);

      return result;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Comment deleted:', result);

      return result;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  getCommentCount: async (postId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments/count`,
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
        throw new Error(`Failed to get comment count: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && typeof result.data === 'number') {
        return result.data;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error getting comment count:', error);
      throw error;
    }
  },
}));