import { useEffect } from 'react';
import SavedPosts from '../components/saved/SavedPosts';
import MainLayout from '../components/layout/MainLayout';

export default function SavedPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <SavedPosts />
      </div>
    </MainLayout>
  );
}
