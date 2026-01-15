// File: src/types/post.ts
// Shared Post interface cho toàn bộ app

export interface Post {
  id: number;
  userId: number;
  username: string;
  userFullName: string;
  userAvatarUrl: string | null;
  caption: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
  isSaved: boolean;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}