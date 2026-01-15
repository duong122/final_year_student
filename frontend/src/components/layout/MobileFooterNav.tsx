import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CompassIcon, PlusSquareIcon, HeartIcon, UserIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: HomeIcon, label: 'Home', path: '/' },
  { icon: CompassIcon, label: 'Explore', path: '/explore' },
  { icon: PlusSquareIcon, label: 'Create', path: '/create' },
  { icon: HeartIcon, label: 'Notifications', path: '/notifications' },
  { icon: UserIcon, label: 'Profile', path: '/profile' },
];

export default function MobileFooterNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200">
      <div className="flex items-center justify-around h-12">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200',
                isActive
                  ? 'text-foreground'
                  : 'text-neutral-400 hover:text-foreground'
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-foreground")} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
