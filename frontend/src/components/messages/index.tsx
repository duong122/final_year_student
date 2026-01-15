// src/components/messages/index.tsx
// ✅ BEST SOLUTION: Calculate exact height considering MainLayout

import React, { useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
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
    handleSelectUser,
  } = useChatStore();

  useEffect(() => {
    const initChat = async () => {
      await loadCurrentUser();
      await loadConversations();
      
      const token = localStorage.getItem('authToken');
      if (token) {
        connectWebSocket(token);
      }
    };

    initChat();
  }, []);

  const handleSelectConversation = (conversationId: number) => {
    setActiveConversation(conversationId);
  };

  const handleUserSelect = async (user: UserSearchResponse) => {
    console.log('🔵 User selected:', user);
    await handleSelectUser(user);
  };

  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      sendMessage(content);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    await deleteMessage(messageId);
  };

  const handleTypingStart = () => {
    sendTypingIndicator(true);
  };

  const handleTypingStop = () => {
    sendTypingIndicator(false);
  };

  const currentMessages = activeConversationId 
    ? messagesByConversation[activeConversationId] || []
    : [];

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

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
    // ✅ CRITICAL: h-screen để Messages fill toàn bộ viewport
    // MainLayout sẽ wrap nó, nhưng Messages phải có h-screen
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        currentUser={currentUser}
        onSelectConversation={handleSelectConversation}
        onSelectUser={handleUserSelect}
        loading={loading}
      />

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

      {!connected && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg z-50">
          ⚠️ Đang kết nối lại...
        </div>
      )}
    </div>
  );
};

export default MessagesPage;