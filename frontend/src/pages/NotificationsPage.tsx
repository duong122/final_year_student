import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import NotificationsList from '../components/notifications/NotificationsList';

export default function NotificationsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <NotificationsList />
      </div>
    </MainLayout>
  );
}
