import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Messages from '../components/messages/index';

export default function MessagesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div>
        <Messages />
      </div>
    </MainLayout>
  );
}
