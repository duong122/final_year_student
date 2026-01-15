// src/components/create/PostCaption.tsx

import { useFeedStore } from '../../stores/feedStore';

interface PostCaptionProps {
  image: string;
  caption: string;
  onCaptionChange: (caption: string) => void;
  filter: string;
}

const FILTERS_MAP: Record<string, string> = {
  none: '',
  clarendon: 'contrast(1.2) saturate(1.35)',
  gingham: 'brightness(1.05) hue-rotate(-10deg)',
  moon: 'grayscale(1) contrast(1.1) brightness(1.1)',
  lark: 'contrast(0.9) saturate(1.1)',
  reyes: 'sepia(0.22) brightness(1.1) contrast(0.85)',
  juno: 'sepia(0.35) contrast(1.15) brightness(1.15) saturate(1.8)',
};

export default function PostCaption({ image, caption, onCaptionChange, filter }: PostCaptionProps) {
  const { currentUser } = useFeedStore();

  return (
    <div className="flex h-full">
      {/* Image Preview */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <img
          src={image}
          alt="Preview"
          className="max-h-full max-w-full object-contain"
          style={{ filter: FILTERS_MAP[filter] }}
        />
      </div>

      {/* Caption Section */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 flex-1 flex flex-col">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={currentUser?.avatarUrl || '/default-avatar.png'}
              alt={currentUser?.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold text-sm">
              {currentUser?.username}
            </span>
          </div>

          {/* Caption Input */}
          <textarea
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Write a caption..."
            className="flex-1 resize-none outline-none text-sm"
            maxLength={2200}
          />

          {/* Character Count */}
          <div className="text-right text-xs text-gray-400 mt-2">
            {caption.length}/2,200
          </div>
        </div>

        {/* Additional Options */}
        <div className="border-t border-gray-200">
          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <span className="text-sm">Add location</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-t border-gray-100">
            <span className="text-sm">Tag people</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}