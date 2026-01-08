'use client';

import Link from 'next/link';
import { Home, Heart, Calendar, User as UserIcon, Shield } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const playerNavItems = [
  { href: '/', label: 'Explore', icon: Home },
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

const ownerNavItems = [
  { href: '/', label: 'Explore', icon: Home },
  { href: '/owner', label: 'Owner', icon: Shield },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    return user && firestore ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);

  const { data: userProfile } = useDoc<{ role: string }>(userProfileRef);
  const isOwner = userProfile?.role === 'owner';

  const navItems = isOwner ? ownerNavItems : playerNavItems;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!user && (href.startsWith('/owner') || href === '/profile' || href === '/favorites' || href === '/bookings')) {
      e.preventDefault();
      router.push(`/auth?redirect=${href}`);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname.startsWith('/courts/');
    }
    if (href === '/owner') {
      return pathname.startsWith('/owner');
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-[0_-1px_4px_rgba(0,0,0,0.05)] md:hidden z-50">
      <div className="container mx-auto max-w-5xl px-0">
        <nav className="flex justify-around items-center h-20 pb-safe">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                href={item.href}
                key={item.label}
                onClick={(e) => handleNavClick(e, item.href)}
                className="flex-1 flex flex-col items-center justify-center h-full relative"
              >
                <div
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 p-2 transition-all duration-300',
                    active && 'bg-primary/10 rounded-xl px-6'
                  )}
                >
                  <item.icon className={cn('h-6 w-6 text-muted-foreground', active && 'text-primary')} />
                  <span
                    className={cn(
                      'text-[10px] font-bold tracking-wider uppercase text-muted-foreground',
                      active && 'text-primary'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                {active && <div className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
