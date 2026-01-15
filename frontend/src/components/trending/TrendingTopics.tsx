import { Card } from '../ui/card';
import { TrendingUpIcon } from 'lucide-react';

const trendingTopics = [
  { tag: '#photography', posts: '12.5K' },
  { tag: '#travel', posts: '8.3K' },
  { tag: '#foodie', posts: '6.7K' },
  { tag: '#fitness', posts: '5.2K' },
];

export default function TrendingTopics() {
  return (
    <Card className="p-6 bg-card text-card-foreground border-border">
      <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
        <TrendingUpIcon className="w-5 h-5 text-primary" />
        Trending Topics
      </h3>
      <div className="space-y-3">
        {trendingTopics.map((topic) => (
          <div
            key={topic.tag}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
          >
            <div>
              <p className="font-medium text-foreground">{topic.tag}</p>
              <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
