// src/components/messages/ConversationItem.tsx

import React from 'react';
// FIX: Cập nhật đường dẫn import
import type { Conversation, User } from '../../types/chat.types';

// NOTE: File này chỉ nên chứa component ConversationItem
interface ConversationItemProps {
  conversation: Conversation;
  currentUser: User;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ 
    conversation, 
    currentUser, 
    isActive, 
    onClick 
}) => {
  // FIX: Lỗi `NodeJS.Timeout` đã được xóa vì logic đó thuộc về MessageInput.
  // Component này chỉ chịu trách nhiệm hiển thị.

  const otherParticipants = conversation.participants.filter((p) => p.userId !== currentUser.id);
  
  const displayName = otherParticipants.length > 0
    ? otherParticipants.map((p) => p.user.fullName).join(', ')
    : 'Cuộc trò chuyện'; // Fallback for empty or self-chat

  const avatarUrl = otherParticipants.length === 1 ? otherParticipants[0].user.avatarUrl : undefined;

  const formatTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getLastMessagePreview = (): string => {
    if (!conversation.lastMessage) return 'Chưa có tin nhắn';
    const { content, senderId, messageType } = conversation.lastMessage;
    const isCurrentUser = senderId === currentUser.id;
    const prefix = isCurrentUser ? 'Bạn: ' : '';

    if (messageType === 'image') return `${prefix}Đã gửi một ảnh`;
    if (messageType === 'video') return `${prefix}Đã gửi một video`;
    if (messageType === 'file') return `${prefix}Đã gửi một file`;
    return `${prefix}${content}`;
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate text-sm">{displayName}</h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatTime(conversation.updatedAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">{getLastMessagePreview()}</p>
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;