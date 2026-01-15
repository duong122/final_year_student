import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, UploadIcon, BellIcon, MessageCircleIcon, UserIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import SearchCommand from '../search/SearchCommand';
import { useModalStore } from '../../stores/modalStore';

export default function TopNavBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { openComposer } = useModalStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-16">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-1 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="hidden sm:block text-xl font-bold text-foreground">SocialApp</span>
        </Link>

        <div className="flex-1 max-w-md hidden md:block">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground bg-neutral-100 text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900 border-neutral-300"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="w-5 h-5 mr-2" />
            <span className="font-normal">SearchIcon users, tags, posts...</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground hover:bg-neutral-100 hover:text-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-neutral-100 hover:text-foreground"
            onClick={openComposer}
          >
            <UploadIcon className="w-6 h-6" />
          </Button>

          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-neutral-100 hover:text-foreground">
              <BellIcon className="w-6 h-6" />
            </Button>
          </Link>

          <Link to="/messages">
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-neutral-100 hover:text-foreground">
              <MessageCircleIcon className="w-6 h-6" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-neutral-100 hover:text-foreground">
                <UserIcon className="w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background text-foreground">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="text-foreground cursor-pointer">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/saved" className="text-foreground cursor-pointer">Saved</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="text-foreground cursor-pointer">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground cursor-pointer">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
