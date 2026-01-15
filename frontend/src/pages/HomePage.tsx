import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import StoriesBar from '../components/stories/StoriesBar';
import FeedList from '../components/feed/FeedList';

export default function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-[630px] mx-auto">
        <StoriesBar />
        <FeedList />
      </div>
    </MainLayout>
  );
}
