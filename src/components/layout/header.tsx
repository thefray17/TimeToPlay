'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
                <p className="text-xs text-muted-foreground">YOUR LOCATION</p>
                <p className="font-bold text-sm">San Francisco, CA</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://picsum.photos/seed/user-avatar/100/100" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
