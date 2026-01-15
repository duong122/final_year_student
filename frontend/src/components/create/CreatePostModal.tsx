// src/components/create/CreatePostModal.tsx

import { useState } from 'react';
import { X } from 'lucide-react';
import ImageUploader from './ImageUploader';
import ImageEditor from './ImageEditor';
import PostCaption from './PostCaption';
import PostPreview from './PostPreview';
import postApiService from '../../lib/postApi.service';
import { useFeedStore } from '../../stores/feedStore';

type Step = 'upload' | 'edit' | 'caption' | 'preview';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [filter, setFilter] = useState('none');
  const [isPosting, setIsPosting] = useState(false);
  
  const { loadPosts } = useFeedStore();

  if (!isOpen) return null;

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setStep('edit');
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (step === 'edit') setStep('caption');
    else if (step === 'caption') setStep('preview');
  };

  const handleBack = () => {
    if (step === 'preview') setStep('caption');
    else if (step === 'caption') setStep('edit');
    else if (step === 'edit') {
      setStep('upload');
      setSelectedImage(null);
      setImagePreview('');
    }
  };

const handlePost = async () => {
  if (!selectedImage) return;
  
  setIsPosting(true);
  
  try {
    // ✅ Sử dụng createPost từ store
    await useFeedStore.getState().createPost(selectedImage, caption.trim());
    
    // Reset và đóng modal
    setStep('upload');
    setSelectedImage(null);
    setImagePreview('');
    setCaption('');
    setFilter('none');
    onClose();
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Failed to create post');
  } finally {
    setIsPosting(false);
  }
};

  const getTitle = () => {
    switch (step) {
      case 'upload': return 'Create new post';
      case 'edit': return 'Edit';
      case 'caption': return 'Create new post';
      case 'preview': return 'Preview';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <button
            onClick={step === 'upload' ? onClose : handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isPosting}
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-base font-semibold">{getTitle()}</h2>
          
          {step !== 'upload' && (
            <button
              onClick={step === 'preview' ? handlePost : handleNext}
              disabled={isPosting}
              className="px-4 py-1.5 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? 'Sharing...' : step === 'preview' ? 'Share' : 'Next'}
            </button>
          )}
          {step === 'upload' && <div className="w-16" />}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {step === 'upload' && (
            <ImageUploader onImageSelect={handleImageSelect} />
          )}
          
          {step === 'edit' && (
            <ImageEditor
              image={imagePreview}
              filter={filter}
              onFilterChange={setFilter}
            />
          )}
          
          {step === 'caption' && (
            <PostCaption
              image={imagePreview}
              caption={caption}
              onCaptionChange={setCaption}
              filter={filter}
            />
          )}
          
          {step === 'preview' && (
            <PostPreview
              image={imagePreview}
              caption={caption}
              filter={filter}
            />
          )}
        </div>
      </div>
    </div>
  );
}