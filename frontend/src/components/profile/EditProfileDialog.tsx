import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Upload, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const UPDATE_PROFILE_URL = `${API_BASE_URL}/api/users/me`;

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    fullName: string;
    bio: string;
    avatarUrl: string;
  };
  onUpdateSuccess: () => void;
}

interface UpdateProfileRequest {
  fullName: string;
  bio: string;
  avatarUrl: string;
}

export default function EditProfileDialog({
  isOpen,
  onClose,
  currentUser,
  onUpdateSuccess,
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: currentUser.fullName,
    bio: currentUser.bio,
    avatarUrl: currentUser.avatarUrl,
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File ảnh không được vượt quá 5MB');
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Tạo FormData để gửi multipart/form-data
      const formDataToSend = new FormData();
      
      // Thêm user data dưới dạng JSON string
      const userJson = JSON.stringify({
        fullName: formData.fullName,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
      });
      formDataToSend.append('user', userJson);
      
      // Thêm avatar file nếu có
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const response = await fetch(UPDATE_PROFILE_URL, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          // Không set Content-Type, browser tự động set với boundary
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Profile updated successfully:', data);

      // Reset form
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Gọi callback để refresh profile
      onUpdateSuccess();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Không thể cập nhật profile';
      console.error('Failed to update profile:', err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form về giá trị ban đầu
    setFormData({
      fullName: currentUser.fullName,
      bio: currentUser.bio,
      avatarUrl: currentUser.avatarUrl,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
    onClose();
  };

  const displayAvatarUrl = avatarPreview || formData.avatarUrl;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 border border-gray-200 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Cập nhật hồ sơ</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Cập nhật thông tin cá nhân của bạn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Avatar Upload */}
            <div className="grid gap-2">
              <Label className="text-foreground">Ảnh đại diện</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={displayAvatarUrl} alt="Avatar preview" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {formData.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-border"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {avatarFile ? 'Đổi ảnh' : 'Tải ảnh lên'}
                  </Button>
                  
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="border-border text-red-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              
              {avatarFile && (
                <p className="text-sm text-muted-foreground">
                  {avatarFile.name} ({(avatarFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="text-foreground">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên của bạn"
                required
                className="bg-background text-foreground border-border"
              />
            </div>

            {/* Bio */}
            <div className="grid gap-2">
              <Label htmlFor="bio" className="text-foreground">
                Tiểu sử
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Viết vài dòng về bản thân..."
                rows={4}
                className="bg-background text-foreground border-border resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-border"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}