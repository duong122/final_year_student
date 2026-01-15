// src/components/create/ImageUploader.tsx

import { useCallback } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <div className="mb-4">
          <ImageIcon className="w-24 h-24 text-gray-300" strokeWidth={1} />
        </div>
        
        <h3 className="text-xl font-light mb-6">
          Drag photos and videos here
        </h3>
        
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors inline-flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Select from computer
          </div>
        </label>
      </div>
    </div>
  );
}