import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './Popover';
import { Button } from '../ui/button';
import { MenuIcon, LogOut, KeyRound } from 'lucide-react';
import ChangePasswordDialog from './ChangePasswordDialog';

interface MoreMenuPopoverProps {
  className?: string;
}

export default function MoreMenuPopover({ className }: MoreMenuPopoverProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  const handleLogout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem('authToken');
    
    // Optional: Xóa các thông tin khác nếu có
    localStorage.removeItem('currentUser');
    
    // Đóng menu
    setIsOpen(false);
    
    // Chuyển hướng về trang login
    navigate('/');
    
    // Optional: Show success message
    console.log('Logged out successfully');
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    setIsChangePasswordDialogOpen(true);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-4 px-3 py-3 h-auto font-normal hover:bg-neutral-50 ${className}`}
          >
            <MenuIcon className="w-6 h-6 stroke-[1.5]" />
            <span className="text-base">More</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          className="w-56 p-1 bg-white border border-gray-200 shadow-lg rounded-lg"
          align="start"
          side="top"
          sideOffset={8}
        >
          <div className="flex flex-col gap-0.5">
            {/* Change Password */}
            <button
              onClick={handleChangePassword}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full text-left"
            >
              <KeyRound className="w-5 h-5" />
              <span>Đổi mật khẩu</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={isChangePasswordDialogOpen}
        onClose={() => setIsChangePasswordDialogOpen(false)}
      />
    </>
  );
}