import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';

const stories = [
  { id: '1', username: 'van_kieuuu', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLjMx-fJDh9Yy6pKuwkRVIWXazXLSz8mNv-Q&s', isYourStory: true },
  { id: '2', username: 'ngoc_ngan', avatar: 'https://wellavn.com/wp-content/uploads/2025/07/anh-gai-xinh-2k12-1.jpg' },
  { id: '3', username: '_luu_bang', avatar: 'https://cdn-images.vtv.vn/2017/phuong-huyen-1504671356701.jpg' },
  { id: '4', username: 'hung_dung', avatar: 'https://bom.edu.vn/public/upload/2024/12/avatar-anh-gai-xinh-che-mat-3.webp' },
  { id: '5', username: '_van_kiet_', avatar: 'https://imgnvsk.vnanet.vn/mediaupload/content/2023/8/15/820-img_20210617_200258.jpg' },
  { id: '6', username: 'hat_huong_duong_', avatar: 'https://avatarmoi.com/wp-content/uploads/2025/07/Anh-gai-xinh-2k5-deo-kinh-can-dang-yeu.webp' },
  { id: '7', username: 'thuyyy_dungn', avatar: 'https://ieclanguage.edu.vn/wp-content/uploads/2025/03/anh-gai-xinh-che-mat-32.jpg' },
  { id: '8', username: 'manh_hung', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI6Yh2AwjqhuAfdPdS8wuWEemOyv8986xuRQ&s' },
];

export default function StoriesBar() {
  return (
    <div className="border-b border-neutral-200 bg-white py-4 sticky top-0 z-10">
      <ScrollArea className="w-full">
        <div className="flex gap-4 px-4">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0">
              <div className={`p-[2px] rounded-full ${story.isYourStory ? 'bg-neutral-200' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500'}`}>
                <div className="bg-white p-[2px] rounded-full">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={story.avatar} alt={story.username} />
                    <AvatarFallback className="bg-neutral-200 text-neutral-600 text-sm">
                      {story.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-foreground max-w-[64px] truncate">
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
