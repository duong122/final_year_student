// src/components/chatbot/ChatbotWindow.tsx
// ✅ FIXED: Smart auto-scroll - only scroll if user is near bottom

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, Loader2, ChevronDown } from 'lucide-react';
import { chatbotService } from '../../lib/chatbot.service';
import type { ChatbotMessage, ChatbotConversation } from '../../types/chatbot.types';
import ChatbotMessageBubble from './ChatbotMessageBubble';

interface ChatbotWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotWindow: React.FC<ChatbotWindowProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<ChatbotConversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledRef = useRef(false);

  // Load conversation when opened
  useEffect(() => {
    if (isOpen) {
      loadConversation();
    }
  }, [isOpen]);

  // ✅ Smart auto-scroll: only scroll if user hasn't manually scrolled up
  useEffect(() => {
    if (!userScrolledRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ✅ Detect user scroll
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    // Update scroll button visibility
    setShowScrollButton(!isNearBottom);

    // Update scroll state
    userScrolledRef.current = !isNearBottom;
  };

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const loadConversation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const conv = await chatbotService.getConversation();
      setConversation(conv);
      
      // Add welcome message if no messages
      if (messages.length === 0) {
        const welcomeMessage: ChatbotMessage = {
          id: 0,
          role: 'assistant',
          content: 'Hi! I\'m Linkly Assistant 👋\n\nHow can I help you today?',
          createdAt: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('Failed to connect to chatbot. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue || isSending) return;

    // Add user message
    const userMessage: ChatbotMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedValue,
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    setError(null);

    // ✅ Auto-scroll to bottom when user sends message
    userScrolledRef.current = false;

    try {
      const response = await chatbotService.sendMessage(trimmedValue);
      
      if (response.success && response.botMessage) {
        setMessages(prev => [...prev, response.botMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsSending(false);
      
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

  // ✅ Scroll to bottom button handler
  const scrollToBottom = () => {
    userScrolledRef.current = false;
    setShowScrollButton(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed right-6 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 ${
        isMinimized ? 'bottom-6 w-80 h-16' : 'bottom-6 w-[420px] h-[600px]'
      }`}
      style={{ zIndex: 1000 }}
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={conversation?.botAvatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=linkly'}
            alt="Linkly Assistant"
            className="w-10 h-10 rounded-full bg-white p-1"
          />
          <div>
            <h3 className="font-semibold text-sm">
              {conversation?.botUsername || 'Linkly Assistant'}
            </h3>
            <p className="text-xs opacity-90">
              {isSending ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body - Only show when not minimized */}
      {!isMinimized && (
        <>
          {/* Messages Container with scroll detection */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 bg-gray-50 relative"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Connecting...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-red-500">
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={loadConversation}
                    className="mt-2 text-xs underline hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <ChatbotMessageBubble
                    key={message.id}
                    message={message}
                    botAvatarUrl={conversation?.botAvatarUrl}
                  />
                ))}
                
                {isSending && (
                  <div className="flex gap-2 justify-start">
                    <img
                      src={conversation?.botAvatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=linkly'}
                      alt="Bot"
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="bg-gray-200 rounded-2xl px-4 py-2 rounded-bl-none">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* ✅ Scroll to Bottom Button */}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="sticky bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                style={{ 
                  position: 'sticky',
                  zIndex: 10,
                  marginTop: '-60px'
                }}
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 rounded-b-lg">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 max-h-32 overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isSending || isLoading}
                  className="w-full bg-transparent resize-none outline-none text-sm max-h-28 overflow-y-auto disabled:opacity-50"
                  rows={1}
                  style={{ minHeight: '24px' }}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isSending || isLoading}
                className={`p-2.5 rounded-full transition-colors ${
                  inputValue.trim() && !isSending && !isLoading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-400 text-center">
              Press Enter to send • Shift + Enter for new line
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotWindow;