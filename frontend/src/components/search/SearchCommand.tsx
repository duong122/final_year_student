import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Dialog, DialogContent } from '../ui/dialog';
import { SearchIcon } from 'lucide-react';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const recentSearches = [
    { type: 'user', name: 'John Doe', username: '@johndoe' },
    { type: 'tag', name: '#photography' },
    { type: 'user', name: 'Jane Smith', username: '@janesmith' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-background text-foreground max-w-2xl">
        <Command className="bg-background text-foreground">
          <CommandInput placeholder="SearchIcon users, tags, posts..." className="text-foreground" />
          <CommandList>
            <CommandEmpty className="text-muted-foreground py-6 text-center">No results found.</CommandEmpty>
            <CommandGroup heading="Recent Searches" className="text-foreground">
              {recentSearches.map((item, index) => (
                <CommandItem key={index} className="text-foreground cursor-pointer hover:bg-neutral-100">
                  <SearchIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.username && (
                      <p className="text-sm text-muted-foreground">{item.username}</p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}