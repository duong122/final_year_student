import { useState } from 'react';
import { ImageIcon, VideoIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useToast } from '../../hooks/use-toast';

export default function FeedComposer() {
  const [content, setContent] = useState('');
  const { toast } = useToast();

  const handlePost = () => {
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please write something before posting.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Your post has been published!',
    });
    setContent('');
  };

  return (
    <Card className="p-6 mb-8 bg-card text-card-foreground border-border">
      <div className="flex gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src="" alt="User avatar" />
          <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 resize-none bg-background text-foreground border-border"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-neutral-100 hover:text-foreground">
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-neutral-100 hover:text-foreground">
                <VideoIcon className="w-5 h-5" />
              </Button>
            </div>
            <Button
              onClick={handlePost}
              className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground font-normal"
            >
              Create Post
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}