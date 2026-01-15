// src/pages/Messages.tsx hoặc src/components/messages/index.tsx

import React, { useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import ConversationList from '../../components/messages/ConversationList';
import ChatWindow from '../../components/messages/ChatWindow';
import type { UserSearchResponse } from '../../types/chat.types';

const MessagesPage: React.FC = () => {
  const {
    currentUser,
    conversations,
    messagesByConversation,
    activeConversationId,
    typingIndicators,
    connected,
    loading,
    error,
    loadCurrentUser,
    loadConversations,
    setActiveConversation,
    connectWebSocket,
    sendMessage,
    deleteMessage,
    sendTypingIndicator,
    handleSelectUser, // ✨ MỚI
  } = useChatStore();

  // Load dữ liệu ban đầu
  useEffect(() => {
    const initChat = async () => {
      // 1. Load user hiện tại
      await loadCurrentUser();
      
      // 2. Load danh sách conversations
      await loadConversations();
      
      // 3. Kết nối WebSocket
      const token = localStorage.getItem('authToken');
      if (token) {
        connectWebSocket(token);
      }
    };

    initChat();
  }, []);

  // Handler khi chọn conversation từ list
  const handleSelectConversation = (conversationId: number) => {
    setActiveConversation(conversationId);
  };

  // ✨ MỚI: Handler khi chọn user từ search results
  const handleUserSelect = async (user: UserSearchResponse) => {
    console.log('🔵 User selected:', user);
    await handleSelectUser(user);
  };

  // Handler gửi tin nhắn
  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      sendMessage(content);
    }
  };

  // Handler xóa tin nhắn
  const handleDeleteMessage = async (messageId: number) => {
    await deleteMessage(messageId);
  };

  // Handler typing indicator
  const handleTypingStart = () => {
    sendTypingIndicator(true);
  };

  const handleTypingStop = () => {
    sendTypingIndicator(false);
  };

  // Lấy messages của conversation đang active
  const currentMessages = activeConversationId 
    ? messagesByConversation[activeConversationId] || []
    : [];

  // Lấy conversation đang active
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // Hiển thị error nếu có
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị loading khi chưa load xong user
  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversation List - Bên trái */}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        currentUser={currentUser}
        onSelectConversation={handleSelectConversation}
        onSelectUser={handleUserSelect} // ✨ MỚI: Truyền handler
        loading={loading}
      />

      {/* Chat Window - Bên phải */}
      <ChatWindow
        conversation={activeConversation || null}
        messages={currentMessages}
        currentUser={currentUser}
        typingIndicators={typingIndicators}
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        onDeleteMessage={handleDeleteMessage}
        loading={loading}
      />

      {/* Connection status indicator */}
      {!connected && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
          ⚠️ Đang kết nối lại...
        </div>
      )}
    </div>
  );
};

export default MessagesPage;