import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Search } from 'lucide-react';

// Types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface Session {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

// SessionList Component
const SessionList: React.FC<{
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
}> = ({ sessions, activeSessionId, onSelectSession }) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              activeSessionId === session.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="relative">
              <img
                src={session.avatar}
                alt={session.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {session.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 truncate">{session.name}</h3>
                <span className="text-xs text-gray-500">{session.timestamp}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 truncate">{session.lastMessage}</p>
                {session.unread > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {session.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// MessageBubble Component
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="text-sm break-words">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isUser && message.status && (
            <span className="text-xs text-gray-500">
              {message.status === 'read' && '✓✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'sent' && '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ChatWindow Component
const ChatWindow: React.FC<{
  session: Session | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
}> = ({ session, messages, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Chọn một cuộc trò chuyện</h3>
          <p className="text-gray-500">Chọn một session để bắt đầu nhắn tin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={session.avatar}
              alt={session.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {session.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{session.name}</h3>
            <p className="text-xs text-gray-500">{session.online ? 'Đang hoạt động' : 'Không hoạt động'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="w-full bg-transparent resize-none outline-none text-sm max-h-32"
              rows={1}
            />
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const ChatApp: React.FC = () => {
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'Chào bạn, hẹn gặp lại!',
      timestamp: '10:30',
      unread: 2,
      online: true,
    },
    {
      id: '2',
      name: 'Trần Thị B',
      avatar: 'https://i.pravatar.cc/150?img=2',
      lastMessage: 'Cảm ơn bạn nhiều nhé',
      timestamp: '09:15',
      unread: 0,
      online: false,
    },
    {
      id: '3',
      name: 'Lê Văn C',
      avatar: 'https://i.pravatar.cc/150?img=3',
      lastMessage: 'Ok, tôi sẽ gửi file cho bạn',
      timestamp: 'Hôm qua',
      unread: 1,
      online: true,
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>('1');
  const [messagesBySession, setMessagesBySession] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        content: 'Xin chào! Bạn khỏe không?',
        sender: 'other',
        timestamp: new Date(2024, 9, 16, 10, 0),
        status: 'read',
      },
      {
        id: '2',
        content: 'Chào bạn! Mình khỏe, cảm ơn bạn nhé',
        sender: 'user',
        timestamp: new Date(2024, 9, 16, 10, 5),
        status: 'read',
      },
      {
        id: '3',
        content: 'Hôm nay bạn có rảnh không?',
        sender: 'other',
        timestamp: new Date(2024, 9, 16, 10, 10),
        status: 'read',
      },
      {
        id: '4',
        content: 'Có chứ, bạn cần gì không?',
        sender: 'user',
        timestamp: new Date(2024, 9, 16, 10, 15),
        status: 'delivered',
      },
    ],
    '2': [],
    '3': [],
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const currentMessages = messagesBySession[activeSessionId] || [];

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
    };

    setMessagesBySession((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), newMessage],
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SessionList
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
      />
      <ChatWindow
        session={activeSession}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatApp;