// components/MessageBubble.tsx
// ✅ FIXED: Get avatar from conversation participants

import React, { useState } from 'react';
import { MoreVertical, Trash2, Copy } from 'lucide-react';
import type { Message, User } from '../../types/chat.types';

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
  showAvatar: boolean;
  onDelete: (messageId: number) => void;
  senderAvatar?: string; // ✅ NEW: Pass avatar from parent
  senderName?: string;   // ✅ NEW: Pass name from parent
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUser,
  showAvatar,
  onDelete,
  senderAvatar,
  senderName,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const isCurrentUser = message.senderId === currentUser.id;

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowOptions(false);
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
      onDelete(message.id);
      setShowOptions(false);
    }
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <img
            src={message.content}
            alt="Message attachment"
            className="max-w-xs rounded-lg"
          />
        );
      case 'video':
        return (
          <video
            src={message.content}
            controls
            className="max-w-xs rounded-lg"
          />
        );
      case 'file':
        return (
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-500 hover:underline"
          >
            📎 File đính kèm
          </a>
        );
      default:
        return (
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.content}
          </p>
        );
    }
  };

  // ✅ Get display info with fallback priority
  const displayAvatar = senderAvatar || message.sender?.avatarUrl;
  const displayName = senderName || message.sender?.fullName || 'User';

  return (
    <div
      className={`flex gap-2 mb-3 group ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Avatar (for other users) */}
      {!isCurrentUser && showAvatar && (
        <div className="flex-shrink-0">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-xs font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {!isCurrentUser && !showAvatar && <div className="w-8" />}

      {/* Message bubble */}
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg ${
          isCurrentUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Sender name (for group chats) */}
        {!isCurrentUser && showAvatar && (
          <p className="text-xs text-gray-500 mb-1 ml-2">
            {displayName}
          </p>
        )}

        <div className="relative">
          <div
            className={`px-4 py-2 rounded-2xl ${
              isCurrentUser
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}
          >
            {renderMessageContent()}
          </div>

          {/* Options menu */}
          <div
            className={`absolute top-0 ${
              isCurrentUser ? 'right-full mr-2' : 'left-full ml-2'
            } opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>

              {showOptions && (
                <div
                  className={`absolute ${
                    isCurrentUser ? 'right-0' : 'left-0'
                  } mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10`}
                >
                  <button
                    onClick={handleCopy}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Sao chép
                  </button>
                  {isCurrentUser && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time */}
        <div
          className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
            isCurrentUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;