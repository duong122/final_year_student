import { Card } from '../../components/ui/card';

export default function CommunityVideo() {
  return (
    <Card className="p-6 bg-card text-card-foreground border-border">
      <h3 className="font-semibold text-lg text-foreground mb-4">Community Announcement</h3>
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/j5a0jTc9S10"
          title="Community Announcement"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      </div>
    </Card>
  );
}
