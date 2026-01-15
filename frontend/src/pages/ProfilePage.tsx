import { useEffect } from 'react';

import MainLayout from '../components/layout/MainLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfilePosts from '../components/profile/ProfilePosts';

export default function ProfilePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <ProfileHeader />
        <ProfilePosts />
      </div>
    </MainLayout>
  );
}
