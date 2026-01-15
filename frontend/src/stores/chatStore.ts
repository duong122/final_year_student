// src/stores/chatStore.ts

import { create } from 'zustand';
import chatApiService from '../lib/chatApi.service';
import websocketService from '../lib/websocket.service';
import type { 
  Conversation, 
  Message, 
  User, 
  TypingIndicator, 
  UserSearchResponse,
  ConversationResponseItem,
} from '../types/chat.types';

import  { 
  isBackendPageResponse,
  isConversationResponseItem,
} from '../types/chat.types';

interface ChatState {
  currentUser: User | null;
  conversations: Conversation[];
  messagesByConversation: Record<number, Message[]>;
  activeConversationId: number | null;
  typingIndicators: TypingIndicator[];
  connected: boolean;
  loading: boolean;
  error: string | null;
}

interface ChatActions {
  setCurrentUser: (user: User) => void;
  connectWebSocket: (token: string) => void;
  loadConversations: () => Promise<void>;
  setActiveConversation: (conversationId: number) => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  sendMessage: (content: string) => void;
  deleteMessage: (messageId: number) => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
  setError: (error: string | null) => void;
  handleSelectUser: (user: UserSearchResponse) => Promise<void>;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  currentUser: null,
  conversations: [],
  messagesByConversation: {},
  activeConversationId: null,
  typingIndicators: [],
  connected: false,
  loading: false,
  error: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  setError: (error) => set({ error }),

  loadCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const result = await chatApiService.getCurrentUser(); 
      
      if (result.success && result.data) {
        set({ currentUser: result.data, loading: false }); 
      } else {
        const errorMessage = result.error || 'Failed to load current user';
        set({ 
          error: errorMessage,
          loading: false,
          currentUser: null
        });
        console.error("Failed to load user:", errorMessage); 
      }
    } catch (error) {
      set({ error: 'System error during user load', loading: false, currentUser: null });
      console.error("Load Current User FAILED:", error);
    }
  },

  loadConversations: async () => {
    set({ loading: true, error: null });
    const currentUser = get().currentUser;

    if (!currentUser) {
      set({ 
        error: 'Người dùng chưa được tải, không thể tải cuộc trò chuyện.', 
        loading: false 
      });
      console.warn("loadConversations: Bỏ qua vì currentUser là null.");
      return; 
    }

    try {
      console.log('📞 Calling getConversations API...');
      const result = await chatApiService.getConversations();
      
      console.log('📦 API Result:', result);
      
      if (!result.success) {
        set({ error: result.error || 'Lỗi tải cuộc trò chuyện.', loading: false });
        return;
      }

      if (!result.data) {
        set({ error: 'Không có dữ liệu trả về.', loading: false });
        return;
      }

      console.log('📊 Result Data:', result.data);

      let conversationsData: Conversation[] = [];

      // ✅ FIX: Kiểm tra format BackendPageResponse
      if (isBackendPageResponse(result.data) && Array.isArray(result.data.content)) {
        console.log('✅ Detected BackendPageResponse format');
        const content = result.data.content;
        
        if (content.length === 0) {
          console.log('📭 No conversations found');
          set({ conversations: [], loading: false });
          return;
        }

        // ✅ Transform từ ConversationResponseItem sang Conversation
        if (isConversationResponseItem(content[0])) {
          console.log('🔄 Transforming ConversationResponseItem to Conversation...');
          
          const apiConversations = content as ConversationResponseItem[];
          
          const currentUserParticipant = {
            userId: currentUser.id,
            user: {
              id: currentUser.id,
              username: currentUser.username,
              fullName: currentUser.fullName,
              avatarUrl: currentUser.avatarUrl,
            },
          };

          conversationsData = apiConversations.map((apiConv) => {
            const participants = [currentUserParticipant];

            if (apiConv.otherUserId) {
              participants.push({
                userId: apiConv.otherUserId,
                user: {
                  id: apiConv.otherUserId,
                  username: apiConv.otherUsername,
                  fullName: apiConv.otherUsername, // Backend không có fullName riêng
                  avatarUrl: apiConv.otherUserAvatarUrl || undefined,
                }
              });
            }

            return {
              id: apiConv.id,
              lastMessage: apiConv.lastMessage || undefined,
              updatedAt: apiConv.updatedAt,
              createdAt: apiConv.updatedAt, // Backend không trả createdAt riêng
              unreadCount: apiConv.unreadCount || 0,
              participants: participants,
            };
          });

          console.log('✅ Transformed conversations:', conversationsData);
        }
      } else if (Array.isArray(result.data)) {
        console.log('✅ Detected Array format');
        conversationsData = result.data as Conversation[];
      } else {
        console.error('❌ Unknown data format:', result.data);
        set({ 
          error: 'Không thể tải danh sách cuộc trò chuyện (Dữ liệu không hợp lệ).', 
          loading: false 
        });
        return;
      }

      console.log('💾 Saving conversations to store:', conversationsData.length);

      set({ 
        conversations: conversationsData, 
        loading: false,
        activeConversationId: 
          get().activeConversationId || conversationsData[0]?.id || null,
        error: null, // ✅ Clear error khi thành công
      });

    } catch (error) {
      console.error("❌ Load conversations error:", error);
      set({ error: 'Lỗi hệ thống khi tải cuộc trò chuyện.', loading: false });
    }
  },

  setActiveConversation: async (conversationId) => {
    set({ activeConversationId: conversationId, loading: true });
    const response = await chatApiService.getConversationMessages(conversationId);

    if (response.success && response.data) {
      const messagesPage = response.data;

      set((state) => ({
        messagesByConversation: { 
          ...state.messagesByConversation,
          [conversationId]: messagesPage.content.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
        },
      }));
    } else {
      set({ error: 'Không thể tải tin nhắn.' });
    }
    set({ loading: false });
  },

  handleSelectUser: async (selectedUser: UserSearchResponse) => {
    set({ loading: true, error: null });
    
    const currentUser = get().currentUser;
    const conversations = get().conversations;

    if (!currentUser) {
      set({ error: 'Người dùng chưa được tải.', loading: false });
      return;
    }

    try {
      console.log('🔍 Checking for existing conversation with user:', selectedUser.id);
      
      // Bước 1: Tìm conversation có sẵn
      const existingConversation = conversations.find(conv => 
        conv.participants.some(p => p.userId === selectedUser.id)
      );

      if (existingConversation) {
        console.log('✅ Found existing conversation:', existingConversation.id);
        await get().setActiveConversation(existingConversation.id);
        set({ loading: false });
        return;
      }

      // Bước 2: Nếu chưa có conversation → Tạo placeholder conversation (chưa lưu DB)
      console.log('🆕 Creating placeholder conversation with user:', selectedUser.id);
      
      // Tạo ID tạm thời (negative để phân biệt với ID thật từ backend)
      const tempConversationId = -Date.now();

      const currentUserParticipant = {
        userId: currentUser.id,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatarUrl: currentUser.avatarUrl,
        },
      };

      const selectedUserParticipant = {
        userId: selectedUser.id,
        user: {
          id: selectedUser.id,
          username: selectedUser.username,
          fullName: selectedUser.fullName,
          avatarUrl: selectedUser.avatarUrl || undefined,
        },
      };

      // Tạo temporary conversation (chỉ ở frontend)
      const tempConversation: Conversation = {
        id: tempConversationId, // ID tạm (âm)
        participants: [currentUserParticipant, selectedUserParticipant],
        lastMessage: undefined,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Thêm vào store (chỉ frontend)
      set((state) => ({
        conversations: [tempConversation, ...state.conversations],
        messagesByConversation: {
          ...state.messagesByConversation,
          [tempConversationId]: [], // Mảng messages rỗng
        },
        activeConversationId: tempConversationId,
        loading: false,
      }));

      console.log('✅ Placeholder conversation created with temp ID:', tempConversationId);
      console.log('💡 User can now type and send first message');

    } catch (error) {
      console.error('❌ Error in handleSelectUser:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Lỗi khi tạo cuộc trò chuyện',
        loading: false 
      });
    }
  },

  sendMessage: (content: string) => {
    const { activeConversationId, conversations, currentUser } = get();
    
    if (!activeConversationId || !currentUser) {
      console.error('❌ No active conversation or current user');
      set({ error: 'Chưa chọn cuộc trò chuyện' });
      return;
    }

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    
    if (!activeConversation) {
      console.error('❌ Active conversation not found');
      set({ error: 'Không tìm thấy cuộc trò chuyện' });
      return;
    }

    const recipientParticipant = activeConversation.participants.find(
      p => p.userId !== currentUser.id
    );

    if (!recipientParticipant) {
      console.error('❌ Recipient not found');
      return;
    }

    const recipientId = recipientParticipant.userId;

    console.log('📤 Sending message:', {
      conversationId: activeConversationId,
      recipientId: recipientId,
      isTemporaryConversation: activeConversationId < 0,
    });

    // ✅ FIX: Nếu là temporary conversation (ID âm) → Gửi tin nhắn đầu tiên sẽ tạo conversation thật
    if (activeConversationId < 0) {
      console.log('🆕 First message in temporary conversation → Will create real conversation');
      
      // Gửi qua API để tạo conversation thật trong DB
      chatApiService.sendMessage({
        recipientId: recipientId,
        content: content,
      }).then((result) => {
        if (result.success && result.data) {
          const newMessage = result.data;
          const realConversationId = newMessage.conversationId;
          
          console.log('✅ Real conversation created with ID:', realConversationId);
          
          // Update store: Thay temp conversation bằng real conversation
          set((state) => {
            // Remove temp conversation
            const updatedConversations = state.conversations
              .filter(c => c.id !== activeConversationId)
              .concat([{
                ...activeConversation,
                id: realConversationId, // ID thật từ backend
                lastMessage: newMessage,
                updatedAt: newMessage.createdAt,
              }]);
            
            // Remove temp messages, add real message
            const { [activeConversationId]: tempMessages, ...restMessages } = state.messagesByConversation;
            
            return {
              conversations: updatedConversations.sort((a, b) => 
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              ),
              messagesByConversation: {
                ...restMessages,
                [realConversationId]: [newMessage],
              },
              activeConversationId: realConversationId,
            };
          });
        } else {
          console.error('❌ Failed to send message:', result.error);
          set({ error: result.error || 'Không thể gửi tin nhắn' });
        }
      });
      
      return; // Exit early - đã xử lý qua API
    }

    // Conversation thật → Gửi qua WebSocket như bình thường
    websocketService.sendMessage(recipientId, content);
  },

  sendTypingIndicator: (isTyping: boolean) => {
    const { activeConversationId, conversations, currentUser } = get();
    
    if (!activeConversationId || !currentUser) return;

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    if (!activeConversation) return;

    const recipientParticipant = activeConversation.participants.find(
      p => p.userId !== currentUser.id
    );

    if (!recipientParticipant) return;

    websocketService.sendTypingIndicator(recipientParticipant.userId, isTyping);
  },

  deleteMessage: async (messageId) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    const response = await chatApiService.deleteMessage(messageId);
    if (response.success) {
      set(state => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [activeConversationId]: state.messagesByConversation[activeConversationId]
            .filter(msg => msg.id !== messageId)
        }
      }));
    } else {
      set({ error: 'Không thể xóa tin nhắn.' });
    }
  },

  connectWebSocket: (token) => {
    websocketService.connect(token).catch(err => {
      set({ error: "Không thể kết nối tới máy chủ chat." });
    });

    websocketService.onConnect(() => {
      console.log('🎉 WebSocket connected');
      set({ connected: true });
    });

    websocketService.onDisconnect(() => {
      console.log('❌ WebSocket disconnected');
      set({ connected: false });
    });

    websocketService.onError((error) => {
      console.error('❌ WebSocket error:', error);
      set({ error });
    });

    websocketService.onMessage((message) => {
      console.log('📨 New message received');
      
      set((state) => {
        const conversationId = message.conversationId;
        
        if (!conversationId) {
          console.error('❌ Message has no conversationId');
          return state;
        }

        const existingMessages = state.messagesByConversation[conversationId] || [];
        const isDuplicate = existingMessages.some(m => m.id === message.id);
        
        if (isDuplicate) {
          console.log('⚠️ Duplicate message ignored');
          return state;
        }

        const updatedMessages = [...existingMessages, message].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const updatedConversations = state.conversations.map(c => 
          c.id === conversationId 
            ? { 
                ...c, 
                lastMessage: message, 
                updatedAt: message.createdAt 
              } 
            : c
        ).sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: updatedMessages,
          },
          conversations: updatedConversations,
        };
      });
    });

    websocketService.onTyping((typing) => {
      set((state) => ({
        typingIndicators: [
          ...state.typingIndicators.filter(t => t.userId !== typing.userId),
          typing,
        ],
      }));
    });
  },
}));