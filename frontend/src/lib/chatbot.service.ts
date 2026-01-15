// src/lib/chatbot.service.ts

import type { SendMessageRequest, SendMessageResponse, ChatbotConversation } from '../types/chatbot.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ChatbotService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Send message to chatbot
  async sendMessage(content: string): Promise<SendMessageResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ content } as SendMessageRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SendMessageResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }

  // Get conversation with chatbot
  async getConversation(): Promise<ChatbotConversation> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/conversation`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatbotConversation = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting chatbot conversation:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      return data;
    } catch (error) {
      console.error('Error checking chatbot health:', error);
      throw error;
    }
  }
}

export const chatbotService = new ChatbotService();