// src/types/chat.types.ts

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: number;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  email?: string;
  bio?: string | null;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  createdAt?: string;
}

export interface UserSearchResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  createdAt: string;
}

// ============================================================================
// CONVERSATION & MESSAGE TYPES
// ============================================================================

export interface Participant {
  userId: number;
  user: User;
  joinedAt?: string;
}

export interface ConversationParticipant extends Participant {}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername?: string; // ✅ Thêm từ response
  senderAvatarUrl?: string | null; // ✅ Thêm từ response
  sender?: User;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  createdAt: string;
}

export interface Conversation {
  id: number;
  participants: Participant[];
  lastMessage?: Message | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TypingIndicator {
  conversationId: number;
  userId: number;
  username: string;
  isTyping: boolean;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface SendMessageRequest {
  conversationId?: number;
  recipientId?: number;
  content: string;
  messageType?: 'text' | 'image' | 'video' | 'file';
}

export interface MessageRequest {
  recipientId: number;
  content: string;
}

export interface CreateConversationRequest {
  participantIds: number[];
  initialMessage?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// ✅ FIX: Response format thực tế từ backend
export interface BackendPageResponse<T> {
  content: T[];
  pageNumber: number;  // ✅ Backend dùng pageNumber thay vì number
  pageSize: number;    // ✅ Backend dùng pageSize thay vì size
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ✅ FIX: Conversation response item thực tế từ backend
export interface ConversationResponseItem {
  id: number;
  otherUserId: number;
  otherUsername: string;
  otherUserAvatarUrl: string | null;
  lastMessage: Message | null;
  updatedAt: string;
  unreadCount?: number; // Optional vì có thể không có trong response
}

export type ConversationResponse = Conversation[] | BackendPageResponse<Conversation>;

// ✅ FIX: Type cho data từ API conversations
export type ConversationApiData = BackendPageResponse<ConversationResponseItem>;

// ============================================================================
// UTILITY TYPES & HELPERS
// ============================================================================

// ✅ FIX: Type guard cho BackendPageResponse
export function isBackendPageResponse<T>(data: any): data is BackendPageResponse<T> {
  return (
    data &&
    typeof data === 'object' &&
    'content' in data &&
    Array.isArray(data.content) &&
    'pageNumber' in data &&
    'totalElements' in data
  );
}

export function isConversationResponseItem(item: any): item is ConversationResponseItem {
  return (
    item &&
    typeof item === 'object' &&
    'otherUserId' in item &&
    'otherUsername' in item
  );
}

export function isConversation(item: any): item is Conversation {
  return (
    item &&
    typeof item === 'object' &&
    'participants' in item &&
    Array.isArray(item.participants)
  );
}

export function normalizeAvatarUrl(avatarUrl: string | null | undefined): string | undefined {
  return avatarUrl === null ? undefined : avatarUrl;
}