// src/lib/websocket.service.ts

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { IMessage } from '@stomp/stompjs';
import type { Message, TypingIndicator } from '../types/chat.types';

class WebSocketService {
  private stompClient: Client | null = null;
  private token: string = '';
  private messageCallbacks: ((message: Message) => void)[] = [];
  private typingCallbacks: ((typing: TypingIndicator) => void)[] = [];
  private connectCallbacks: (() => void)[] = [];
  private disconnectCallbacks: (() => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
   private isConnecting: boolean = false;

  async connect(token: string): Promise<void> {
    // ⭐ Nếu đã connected hoặc đang connecting, không kết nối lại
    if (this.stompClient?.connected) {
      console.log('⚠️ Already connected, skipping');
      return Promise.resolve();
    }

    if (this.isConnecting) {
      console.log('⚠️ Already connecting, skipping');
      return Promise.resolve();
    }

    this.token = token;

    return new Promise((resolve, reject) => {
      this.stompClient = new Client({
        webSocketFactory: () => {
          console.log('🔌 Creating SockJS connection...');
          return new SockJS('http://localhost:8080/ws') as any;
        },
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('🔍 STOMP:', str);
        },
        onConnect: () => {
          console.log('✅ WebSocket Connected Successfully!');
          this.setupSubscriptions();
          this.connectCallbacks.forEach(cb => cb());
          resolve();
        },
        onStompError: (frame) => {
          console.error('❌ STOMP Error:', frame);
          const errorMsg = frame.headers['message'] || 'Connection failed';
          this.errorCallbacks.forEach(cb => cb(errorMsg));
          reject(new Error(errorMsg));
        },
        onWebSocketClose: () => {
          console.log('🔌 WebSocket Closed');
          this.disconnectCallbacks.forEach(cb => cb());
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      console.log('🚀 Activating STOMP client...');
      this.stompClient.activate();
    });
  }

  private setupSubscriptions(): void {
    if (!this.stompClient) return;

    console.log('📡 Setting up subscriptions...');

    // ⭐ SUBSCRIBE TO MESSAGES - Enhanced logging
    this.stompClient.subscribe('/user/queue/messages', (message: IMessage) => {
      try {
        console.log('📨 RAW MESSAGE RECEIVED');
        console.log('📨 Raw body:', message.body);
        console.log('📨 Headers:', message.headers);
        
        const parsed = JSON.parse(message.body);
        
        console.log('📨 PARSED MESSAGE:', parsed);
        console.log('📨 Message structure check:', {
          hasId: !!parsed.id,
          hasConversationId: !!parsed.conversationId,
          hasSenderId: !!parsed.senderId,
          hasContent: !!parsed.content,
          hasCreatedAt: !!parsed.createdAt,
          actualKeys: Object.keys(parsed)
        });

        // ⭐ Trigger all registered callbacks
        console.log(`📨 Triggering ${this.messageCallbacks.length} message callbacks`);
        this.messageCallbacks.forEach((cb, index) => {
          console.log(`📨 Calling callback #${index}`);
          cb(parsed);
        });
        
      } catch (error) {
        console.error('❌ Failed to parse message:', error);
        console.error('❌ Raw message body:', message.body);
      }
    });

    // ⭐ SUBSCRIBE TO TYPING INDICATORS
    this.stompClient.subscribe('/user/queue/typing', (message: IMessage) => {
      try {
        console.log('⌨️ RAW TYPING INDICATOR:', message.body);
        const parsed = JSON.parse(message.body);
        console.log('⌨️ Parsed typing:', parsed);
        this.typingCallbacks.forEach(cb => cb(parsed));
      } catch (error) {
        console.error('❌ Failed to parse typing indicator:', error);
      }
    });

    // ⭐ SUBSCRIBE TO ERRORS
    this.stompClient.subscribe('/user/queue/errors', (message: IMessage) => {
      console.error('❌ Server error received:', message.body);
      this.errorCallbacks.forEach(cb => cb(message.body));
    });

    console.log('✅ Subscriptions set up complete');
    console.log(`✅ Registered ${this.messageCallbacks.length} message callbacks`);
    console.log(`✅ Registered ${this.typingCallbacks.length} typing callbacks`);
  }

  sendMessage(recipientId: number, content: string): void {
    if (!this.stompClient?.connected) {
      console.error('❌ Not connected - cannot send message');
      this.errorCallbacks.forEach(cb => cb('WebSocket not connected'));
      return;
    }

    const payload = {
      recipientId,
      content: content.trim(),
    };

    console.log('📤 Sending message:', payload);
    console.log('📤 Destination: /app/chat.send');

    try {
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(payload),
      });
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  sendTypingIndicator(recipientId: number, isTyping: boolean): void {
    if (!this.stompClient?.connected) {
      console.warn('⚠️ Not connected - cannot send typing indicator');
      return;
    }

    console.log(`⌨️ Sending typing indicator: recipientId=${recipientId}, isTyping=${isTyping}`);

    try {
      this.stompClient.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify(recipientId),
      });
    } catch (error) {
      console.error('❌ Error sending typing indicator:', error);
    }
  }

  onConnect(callback: () => void): void {
    console.log('📝 Registering connect callback');
    this.connectCallbacks.push(callback);
  }

  onDisconnect(callback: () => void): void {
    console.log('📝 Registering disconnect callback');
    this.disconnectCallbacks.push(callback);
  }

  onMessage(callback: (message: Message) => void): void {
    console.log('📝 Registering message callback');
    this.messageCallbacks.push(callback);
    console.log(`📝 Total message callbacks: ${this.messageCallbacks.length}`);
  }

  onTyping(callback: (typing: TypingIndicator) => void): void {
    console.log('📝 Registering typing callback');
    this.typingCallbacks.push(callback);
  }

  onError(callback: (error: string) => void): void {
    console.log('📝 Registering error callback');
    this.errorCallbacks.push(callback);
  }

  disconnect(): void {
    if (this.stompClient) {
      console.log('🔌 Disconnecting WebSocket...');
      this.stompClient.deactivate();
      this.stompClient = null;
      
      // Clear all callbacks
      this.messageCallbacks = [];
      this.typingCallbacks = [];
      this.connectCallbacks = [];
      this.disconnectCallbacks = [];
      this.errorCallbacks = [];
      
      console.log('✅ WebSocket disconnected and callbacks cleared');
    }
  }

  isConnected(): boolean {
    const connected = this.stompClient?.connected ?? false;
    console.log(`🔍 Connection status: ${connected}`);
    return connected;
  }
}

export default new WebSocketService();