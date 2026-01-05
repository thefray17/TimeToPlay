'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Shield, Settings, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const navItems = [
  { href: '/owner', label: 'Dashboard', icon: Shield },
  { href: '/owner/bookings', label: 'Bookings', icon: Calendar },
  { href: '/owner/courts', label: 'My Courts', icon: Home },
  { href: '/owner/settings', label: 'Settings', icon: Settings },
];

export default function OwnerNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background hidden md:flex flex-col">
      <div className="p-4 border-b">
        <Link href="/owner">
            <h2 className="text-xl font-bold italic tracking-tight">OWNER_</h2>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/owner' && pathname.startsWith(item.href));
          return (
            <Link key={item.label} href={item.href} passHref>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
       <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-center">
            <Bot className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
      </div>
    </aside>
  );
}
