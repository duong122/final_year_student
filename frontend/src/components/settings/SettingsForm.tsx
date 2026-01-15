import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';

export default function SettingsForm() {
  return (
    <Card className="p-8 bg-card text-card-foreground border-border">
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">Account Settings</h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                defaultValue="johndoe"
                className="mt-2 bg-background text-foreground border-border"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="john@example.com"
                className="mt-2 bg-background text-foreground border-border"
              />
            </div>
            <div>
              <Label htmlFor="bio" className="text-foreground">Bio</Label>
              <Textarea
                id="bio"
                defaultValue="Photography enthusiast | Travel lover | Coffee addict"
                className="mt-2 bg-background text-foreground border-border"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">Privacy Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="private" className="text-foreground">Private Account</Label>
                <p className="text-sm text-muted-foreground">Only approved followers can see your posts</p>
              </div>
              <Switch id="private" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-foreground">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications about activity</p>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
          </div>
        </div>

        <Button className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground font-normal">
          Save Changes
        </Button>
      </div>
    </Card>
  );
}
