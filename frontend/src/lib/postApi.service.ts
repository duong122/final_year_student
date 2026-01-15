// src/services/postApi.service.ts

import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export interface CreatePostRequest {
  image: File;
  caption: string;
}

export interface Post {
  id: number;
  imageUrl: string;
  caption: string;
  userId: number;
  username: string;
  userAvatarUrl: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

class PostApiService {
  async createPost(data: CreatePostRequest): Promise<Post> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('caption', data.caption);

    try {
      const response = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Post created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating post:', error);
      throw error;
    }
  }

  async getPosts(page: number = 0, size: number = 10): Promise<Post[]> {
    const token = localStorage.getItem('token');
    
    const response = await axios.get(`${API_URL}/posts`, {
      params: { page, size },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data.content || response.data;
  }
}

export default new PostApiService();