// src/pages/MessagesPage.tsx
// ✅ FIXED: Don't wrap MainLayout, just prevent scroll

import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Messages from '../components/messages/index';

export default function MessagesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // ✅ Prevent body scroll when on Messages page
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore scroll when leaving page
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    // ✅ DON'T wrap MainLayout in div - it handles its own layout
    <MainLayout>
      <Messages />
    </MainLayout>
  );
}