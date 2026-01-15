import type { ReactNode } from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex max-w-[1400px] mx-auto">
        <LeftSidebar />
        <main className="flex-1 min-h-screen border-r border-neutral-200">
          {children}
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
