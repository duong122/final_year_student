// src/components/create/PostPreview.tsx

import { useFeedStore } from '../..//stores/feedStore';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';

interface PostPreviewProps {
  image: string;
  caption: string;
  filter: string;
}

const FILTERS_MAP: Record<string, string> = {
  none: '',
  clarendon: 'contrast(1.2) saturate(1.35)',
  gingham: 'brightness(1.05) hue-rotate(-10deg)',
  moon: 'grayscale(1) contrast(1.1) brightness(1.1)',
  lark: 'contrast(0.9) saturate(1.1)',
  reyes: 'sepia(0.22) brightness(1.1) contrast(0.85)',
};

export default function PostPreview({ image, caption, filter }: PostPreviewProps) {
  const { currentUser } = useFeedStore();

  return (
    <div className="flex items-center justify-center h-full bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Post Header */}
        <div className="flex items-center gap-3 p-3 border-b">
          <img
            src={currentUser?.avatarUrl || '/default-avatar.png'}
            alt={currentUser?.username || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-semibold text-sm">
            {currentUser?.username || 'User'}
          </span>
        </div>

        {/* Post Image */}
        <div className="aspect-square bg-black">
          <img
            src={image}
            alt="Post preview"
            className="w-full h-full object-cover"
            style={{ filter: FILTERS_MAP[filter] || '' }}
          />
        </div>

        {/* Post Actions */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Heart className="w-6 h-6 cursor-pointer hover:text-gray-500" />
              <MessageCircle className="w-6 h-6 cursor-pointer hover:text-gray-500" />
              <Send className="w-6 h-6 cursor-pointer hover:text-gray-500" />
            </div>
            <Bookmark className="w-6 h-6 cursor-pointer hover:text-gray-500" />
          </div>

          {/* Caption */}
          {caption && (
            <div className="text-sm">
              <span className="font-semibold mr-2">{currentUser?.username || 'User'}</span>
              <span className="text-gray-700">{caption}</span>
            </div>
          )}

          {/* Time */}
          <p className="text-xs text-gray-400 mt-2">Just now</p>
        </div>
      </div>
    </div>
  );
}