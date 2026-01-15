// src/components/messages/ChatWindow.tsx
// ✅ UPDATED: Pass conversation to MessageList

import React, { useState } from 'react';
import { Phone, Video, MoreVertical } from 'lucide-react';
import type { Conversation, Message, User, TypingIndicator } from '../../types/chat.types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUser: User;
  typingIndicators: TypingIndicator[];
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onDeleteMessage: (messageId: number) => void;
  loading?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  currentUser,
  typingIndicators,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onDeleteMessage,
  loading = false,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chọn một cuộc trò chuyện
          </h3>
          <p className="text-gray-500">
            Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin.
          </p>
        </div>
      </div>
    );
  }

  const otherParticipants = conversation.participants.filter(
    (p) => p.userId !== currentUser.id
  );

  const displayName = otherParticipants.length === 1
    ? otherParticipants[0].user.fullName
    : otherParticipants.map((p) => p.user.fullName).join(', ');

  const avatarUrl = otherParticipants.length === 1
    ? otherParticipants[0].user.avatarUrl
    : undefined;

  const isTyping = typingIndicators.some(
    (t) => t.conversationId === conversation.id && t.isTyping && t.userId !== currentUser.id
  );

  const typingUsers = typingIndicators
    .filter((t) => t.conversationId === conversation.id && t.isTyping && t.userId !== currentUser.id)
    .map((t) => t.username);

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      
      {/* Header - Fixed height ~64px */}
      <div className="flex-shrink-0 h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
            {isTyping && (
              <p className="text-xs text-blue-500 italic truncate">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} đang nhập...`
                  : `${typingUsers.length} người đang nhập...`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {showOptions && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowOptions(false)}
                />
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors">
                    Xem thông tin
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-red-600">
                    Xóa cuộc trò chuyện
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ CRITICAL: Pass conversation to MessageList */}
      <MessageList
        messages={messages}
        currentUser={currentUser}
        conversation={conversation} // ✅ ADD THIS
        loading={loading}
        onDeleteMessage={onDeleteMessage}
      />

      {/* MessageInput - Fixed height ~80px */}
      <div className="flex-shrink-0">
        <MessageInput
          onSendMessage={onSendMessage}
          onTypingStart={onTypingStart}
          onTypingStop={onTypingStop}
        />
      </div>
    </div>
  );
};

export default ChatWindow;