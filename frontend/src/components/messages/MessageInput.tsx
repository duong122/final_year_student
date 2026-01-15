// components/MessageInput.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Image } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Start typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTypingStart();
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop();
      }
    }, 2000);
  };

  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    
    if (trimmedValue) {
      onSendMessage(trimmedValue);
      setInputValue('');
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        onTypingStop();
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload logic
      console.log('File selected:', file);
      // You would typically upload the file to your server here
      // and get back a URL to send in the message
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-end gap-2">
        {/* File upload button */}
        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <Paperclip className="w-5 h-5 text-gray-600" />
        </label>

        {/* Image upload button */}
        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*"
          />
          <Image className="w-5 h-5 text-gray-600" />
        </label>

        {/* Text input */}
        <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 max-h-32 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="w-full bg-transparent resize-none outline-none text-sm max-h-28 overflow-y-auto"
            rows={1}
            style={{ minHeight: '24px' }}
          />
        </div>

        {/* Emoji button */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Smile className="w-5 h-5 text-gray-600" />
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className={`p-2 rounded-full transition-colors ${
            inputValue.trim()
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Hints */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        Nhấn Enter để gửi, Shift + Enter để xuống dòng
      </div>
    </div>
  );
};

export default MessageInput;