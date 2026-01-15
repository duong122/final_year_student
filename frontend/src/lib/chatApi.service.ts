// src/lib/chatApi.service.ts

import type { 
  Conversation,
  ConversationResponseItem,
  Message, 
  SendMessageRequest, 
  CreateConversationRequest,
  ApiResponse,
  Page,
  User,
  ConversationApiData,
  UserSearchResponse,
  MessageRequest,
} from '../types/chat.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ✅ Interface cho response thực tế từ backend
interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ChatApiService {
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  private async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('API Error Body:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const textData = await response.text();
      
      if (!textData) {
        return {
          success: true,
          data: undefined as T,
        };
      }

      const jsonData = JSON.parse(textData);
      
      // ✅ FIX: Xử lý response có wrapper {success, message, data}
      if (jsonData.success !== undefined && 'data' in jsonData) {
        // Backend trả về format: { success, message, data }
        return {
          success: jsonData.success,
          data: jsonData.data as T,
          error: jsonData.success ? undefined : jsonData.message,
        };
      }
      
      // Fallback: Response không có wrapper
      if ('success' in jsonData) {
        return jsonData as ApiResponse<T>;
      }
      
      // Fallback: Wrap raw data
      return {
        success: true,
        data: jsonData as T,
      };

    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: undefined as T,
      };
    }
  }

  // ============================================================================
  // MESSAGE APIs
  // ============================================================================

  async sendMessage(request: SendMessageRequest | MessageRequest): Promise<ApiResponse<Message>> {
    return this.fetchWithAuth<Message>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getConversations(): Promise<ApiResponse<ConversationApiData>> {
    return this.fetchWithAuth<ConversationApiData>('/api/messages/conversations');
  }

  async getConversationMessages(
    conversationId: number,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<Page<Message>>> { 
    return this.fetchWithAuth<Page<Message>>(
      `/api/messages/conversations/${conversationId}?page=${page}&size=${size}`
    );
  }

  async deleteMessage(messageId: number): Promise<ApiResponse<void>> {
    return this.fetchWithAuth<void>(`/api/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async createConversation(
    request: CreateConversationRequest
  ): Promise<ApiResponse<Conversation>> {
    return this.fetchWithAuth<Conversation>('/api/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ============================================================================
  // USER APIs
  // ============================================================================

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const token = this.getAuthToken();
    if (!token) {
      return { 
        success: false, 
        error: 'Authentication token not found.', 
        data: undefined 
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: 'Failed to fetch user' 
        }));
        return { 
          success: false, 
          error: errorData.message || `Error status: ${response.status}`, 
          data: undefined 
        };
      }

      const userData: User = await response.json();
      return { success: true, data: userData };

    } catch (error) {
      console.error('Get current user failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
        data: undefined,
      };
    }
  }

  async searchUsers(
    keyword: string,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<UserSearchResponse[]>> {
    const token = this.getAuthToken();
    if (!token) {
      return { 
        success: false, 
        error: 'Authentication token not found.', 
        data: undefined 
      };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: 'Failed to search users' 
        }));
        return { 
          success: false, 
          error: errorData.message || `Error status: ${response.status}`, 
          data: undefined 
        };
      }

      const usersData: UserSearchResponse[] = await response.json();
      return { success: true, data: usersData };

    } catch (error) {
      console.error('Search users failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
        data: undefined,
      };
    }
  }

  async getOrCreateConversationWithUser(
    recipientId: number
  ): Promise<ApiResponse<{ conversationId: number; message: Message }>> {
    const result = await this.sendMessage({
      recipientId: recipientId,
      content: '',
    });

    if (result.success && result.data) {
      return {
        success: true,
        data: {
          conversationId: result.data.conversationId,
          message: result.data,
        },
      };
    }

    return {
      success: false,
      error: result.error || 'Failed to create conversation',
      data: undefined,
    };
  }
}

export const chatApiService = new ChatApiService();
export default chatApiService;  