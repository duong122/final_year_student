// src/components/chatbot/ChatbotMessageBubble.tsx

import React from 'react';
import type { ChatbotMessage } from '../../types/chatbot.types';
import ReactMarkdown from 'react-markdown';

interface ChatbotMessageBubbleProps {
  message: ChatbotMessage;
  botAvatarUrl?: string;
}

const ChatbotMessageBubble: React.FC<ChatbotMessageBubbleProps> = ({
  message,
  botAvatarUrl,
}) => {
  const isUser = message.role === 'user';

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`flex gap-2 mb-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex-shrink-0">
          <img
            src={botAvatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=linkly'}
            alt="Linkly Assistant"
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}

      {/* Message bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          {isUser ? (
            <p className="text-sm break-words whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="text-sm prose prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Time */}
        <div
          className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatbotMessageBubble;