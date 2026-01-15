import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SearchUsers from '../components/search/SearchUsers';

export default function ExplorePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <SearchUsers />
      </div>
    </MainLayout>
  );
}
