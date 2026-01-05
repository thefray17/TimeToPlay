'use client';

import Link from 'next/link';
import { Home, Map, CalendarDays, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Explore', icon: Home },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-[0_-1px_4px_rgba(0,0,0,0.05)] md:hidden z-50">
      <div className="container mx-auto max-w-5xl px-0">
        <nav className="flex justify-around items-center h-16 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link href={item.href} key={item.label} className="flex-1">
                <div
                  className={cn(
                    'flex flex-col items-center justify-center h-full gap-1 text-muted-foreground',
                    isActive && 'text-primary'
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
