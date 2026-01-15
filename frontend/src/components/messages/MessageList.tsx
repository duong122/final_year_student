// components/MessageList.tsx
// ✅ FIXED: Pass sender avatar from conversation to MessageBubble

import React, { useRef, useEffect, useMemo } from 'react';
import type { Message, User, Conversation } from '../../types/chat.types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  conversation: Conversation | null; // ✅ NEW: Need conversation
  loading?: boolean;
  onDeleteMessage: (messageId: number) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  conversation,
  loading = false,
  onDeleteMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Create sender info map from conversation participants
  const senderInfoMap = useMemo(() => {
    if (!conversation) return new Map();
    
    const map = new Map<number, { avatar: string; name: string }>();
    
    conversation.participants.forEach(participant => {
      map.set(participant.userId, {
        avatar: participant.user.avatarUrl || '',
        name: participant.user.fullName || participant.user.username
      });
    });
    
    return map;
  }, [conversation]);

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt);
      const dateKey = date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải tin nhắn...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">👋</p>
          <p>Chưa có tin nhắn nào</p>
          <p className="text-sm">Hãy gửi tin nhắn đầu tiên!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="space-y-4">
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                {date}
              </div>
            </div>

            {/* Messages */}
            {msgs.map((message, index) => {
              const prevMessage = index > 0 ? msgs[index - 1] : null;
              const showAvatar =
                !prevMessage || prevMessage.senderId !== message.senderId;

              // ✅ Get sender info from map
              const senderInfo = senderInfoMap.get(message.senderId);

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  currentUser={currentUser}
                  showAvatar={showAvatar}
                  onDelete={onDeleteMessage}
                  senderAvatar={senderInfo?.avatar} // ✅ Pass avatar
                  senderName={senderInfo?.name}     // ✅ Pass name
                />
              );
            })}
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;