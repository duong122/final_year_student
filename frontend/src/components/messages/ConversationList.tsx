// src/components/messages/ConversationList.tsx

import React, { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import type { Conversation, User, UserSearchResponse } from '../../types/chat.types';
import ConversationItem from './ConversationItem';
import chatApiService from '../../lib/chatApi.service';

interface ConversationListProps {
  conversations: Conversation[] | null | undefined;
  activeConversationId: number | null;
  currentUser: User;
  onSelectConversation: (id: number) => void;
  onCreateConversation?: () => void;
  onSelectUser: (user: UserSearchResponse) => void; // ✨ MỚI: Callback khi chọn user
  loading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  currentUser,
  onSelectConversation,
  onCreateConversation,
  onSelectUser,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(conversations ?? []);
  const [searchResults, setSearchResults] = useState<UserSearchResponse[]>([]); // ✨ MỚI
  const [isSearchingUsers, setIsSearchingUsers] = useState(false); // ✨ MỚI
  const [searchMode, setSearchMode] = useState<'conversations' | 'users'>('conversations'); // ✨ MỚI

  // ✨ MỚI: Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearchUsers();
      } else {
        setSearchMode('conversations');
        setSearchResults([]);
      }
    }, 500); // Đợi 500ms sau khi user ngừng gõ

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Lọc conversations (logic cũ)
  useEffect(() => {
    const safeConversations = conversations ?? []; 
    
    if (searchQuery.trim() === '') {
      setFilteredConversations(safeConversations);
    } else if (searchMode === 'conversations') {
      const query = searchQuery.toLowerCase();
      const filtered = safeConversations.filter((conv) => {
        const otherParticipants = conv.participants.filter(
          (p) => p.userId !== currentUser.id
        );
        return otherParticipants.some((p) =>
          p.user.fullName.toLowerCase().includes(query) ||
          p.user.username.toLowerCase().includes(query)
        );
      });
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations, currentUser.id, searchMode]);

  // ✨ MỚI: Tìm kiếm users
  const handleSearchUsers = async () => {
    if (searchQuery.trim().length < 2) return;

    setIsSearchingUsers(true);
    setSearchMode('users');

    try {
      const result = await chatApiService.searchUsers(searchQuery.trim(), 0, 10);
      
      if (result.success && result.data) {
        // Lọc bỏ chính mình khỏi kết quả
        const filteredUsers = result.data.filter(user => user.id !== currentUser.id);
        setSearchResults(filteredUsers);
      } else {
        console.error('Search users failed:', result.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  // ✨ MỚI: Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchMode('conversations');
  };

  const arrayToSort = Array.isArray(filteredConversations) ? filteredConversations : [];
  const sortedConversations = [...arrayToSort].sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    return timeB - timeA;
  });

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          {onCreateConversation && (
            <button
              onClick={onCreateConversation}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Tạo cuộc trò chuyện mới"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Search box */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm người dùng hoặc tin nhắn..."
            className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search mode indicator */}
        {searchQuery.trim().length >= 2 && (
          <div className="mt-2 text-xs text-gray-500">
            {searchMode === 'users' ? (
              <span>🔍 Tìm kiếm người dùng...</span>
            ) : (
              <span>💬 Tìm kiếm trong tin nhắn</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading || isSearchingUsers ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : searchMode === 'users' && searchResults.length > 0 ? (
          // ✨ MỚI: Hiển thị kết quả tìm kiếm users
          <div className="divide-y divide-gray-100">
            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
              KẾT QUẢ TÌM KIẾM ({searchResults.length})
            </div>
            {searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="relative flex-shrink-0">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.fullName} 
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-semibold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-sm">
                    {user.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    @{user.username}
                  </p>
                </div>
                <div className="text-xs text-blue-500 font-medium">
                  Nhắn tin
                </div>
              </div>
            ))}
          </div>
        ) : searchMode === 'users' && searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <p className="text-sm text-center">
              Không tìm thấy người dùng với từ khóa "{searchQuery}"
            </p>
          </div>
        ) : sortedConversations.length === 0 ? (
          // Không có conversations
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <p className="text-sm text-center">
              {searchQuery ? 'Không tìm thấy' : 'Chưa có cuộc trò chuyện'}
            </p>
          </div>
        ) : (
          // Hiển thị conversations
          sortedConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              currentUser={currentUser}
              isActive={activeConversationId === conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;