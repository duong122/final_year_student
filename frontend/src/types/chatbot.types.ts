// src/types/chatbot.types.ts

export interface ChatbotMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  messageId?: number;
}

export interface ChatbotConversation {
  id: number;
  userId: number;
  conversationId: number;
  botUsername: string;
  botAvatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  botMessage: ChatbotMessage;
  conversationId: number;
}