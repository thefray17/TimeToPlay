'use client';

import Link from 'next/link';
import { Home, Map, CalendarDays, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Explore' },
  { href: '#', icon: Map, label: 'Map' },
  { href: '#', icon: CalendarDays, label: 'Bookings' },
  { href: '#', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t md:hidden z-50">
      <div className="container mx-auto">
        <nav className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link href={item.href} key={item.label}>
                <div
                  className={cn(
                    'flex flex-col items-center gap-1 text-muted-foreground',
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
