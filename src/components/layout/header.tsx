'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin } from 'lucide-react';
import { useUser } from '@/firebase';
import Link from 'next/link';

export default function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
                <p className="text-xs text-muted-foreground">YOUR LOCATION</p>
                <p className="font-bold text-sm">San Francisco, CA</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Avatar className="h-9 w-9 cursor-pointer">
              {user ? (
                <>
                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                  <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                </>
              ) : (
                <div className="h-full w-full rounded-full bg-gradient-to-br from-green-300 to-blue-400"></div>
              )}
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
