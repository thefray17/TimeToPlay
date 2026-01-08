'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut, User } from 'firebase/auth';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Zap,
  Users,
  MoveUpRight,
  Settings,
  CreditCard,
  Bell,
  Shield,
  ChevronRight,
  LogOut,
  Loader2,
  Star,
  Grid3x3,
} from 'lucide-react';
import Header from '@/components/layout/header';
import Link from 'next/link';

// --- Reusable Components ---

const ProfileHeader = ({ user }: { user: User }) => (
  <div className="flex flex-col items-center text-center">
    <div className="relative mb-4">
      <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-green-300 via-amber-200 to-pink-300 blur-md opacity-70" />
      <Avatar className="w-24 h-24 border-4 border-background relative z-10">
        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
        <AvatarFallback>
          {user.displayName
            ? user.displayName.split(' ').map((n: string) => n[0]).join('')
            : user.email?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="absolute bottom-1 right-1 z-20 h-7 w-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
        <Star className="h-4 w-4 text-white fill-white" />
      </div>
    </div>
    <h1 className="text-2xl font-bold">{user.displayName || 'Player'}</h1>
    <div className="flex items-center gap-2 mt-2">
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">PRO MEMBER</Badge>
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">RANK #12</Badge>
    </div>
  </div>
);

const OwnerDashboardBanner = () => (
  <Link href="/owner" passHref>
    <Card className="bg-gray-800 text-white rounded-3xl overflow-hidden relative border-gray-700 mt-8 cursor-pointer group">
      <CardContent className="p-6 relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-primary tracking-wider flex items-center gap-2">
            <Grid3x3 className="h-3 w-3" /> PARTNER PORTAL
          </p>
          <h3 className="text-2xl font-bold mt-1">Owner Dashboard</h3>
          <p className="text-xs text-gray-400 font-semibold tracking-wider mt-1">
            MANAGE COURTS & BOOKINGS
          </p>
        </div>
        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
          <ChevronRight className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
      <div className="absolute -top-4 -right-8 w-32 h-32 rounded-full bg-white/5 transition-transform group-hover:scale-125" />
    </Card>
  </Link>
);

const StatsCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
    <Card className="bg-card rounded-3xl border">
      <CardContent className="p-6 relative">
        <p className="text-xs font-bold text-muted-foreground tracking-wider">YOUR CREW</p>
        <h3 className="text-xl font-bold mt-1">Baseline Elites</h3>
        <div className="flex items-center mt-4">
          <div className="flex -space-x-2">
            <Avatar className="h-6 w-6 border-2 border-card">
              <AvatarImage src="https://i.pravatar.cc/32?u=a" />
            </Avatar>
            <Avatar className="h-6 w-6 border-2 border-card">
              <AvatarImage src="https://i.pravatar.cc/32?u=b" />
            </Avatar>
            <Avatar className="h-6 w-6 border-2 border-card">
              <AvatarImage src="https://i.pravatar.cc/32?u=c" />
            </Avatar>
          </div>
          <span className="text-xs text-muted-foreground ml-2">+8 more</span>
        </div>
        <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 h-8 w-8 text-muted-foreground hover:bg-secondary">
          <MoveUpRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
    <Card className="bg-card rounded-3xl border">
      <CardContent className="p-6 text-center">
        <div className="inline-flex p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full mb-2">
          <Zap className="h-6 w-6 text-orange-500" />
        </div>
        <p className="text-xs font-bold text-muted-foreground tracking-wider">TOTAL PLAYTIME</p>
        <p className="text-4xl font-extrabold mt-1">
          124 <span className="text-2xl text-muted-foreground">hrs</span>
        </p>
      </CardContent>
    </Card>
  </div>
);

const AccountRow = ({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="flex items-center p-4 bg-card rounded-2xl border hover:bg-secondary/50 transition-colors cursor-pointer"
  >
    <div className="p-3 bg-secondary rounded-xl">
      <Icon className="h-5 w-5 text-foreground" />
    </div>
    <div className="flex-1 ml-4">
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground" />
  </div>
);

function ProfileView({ user }: { user: User }) {
  const { toast } = useToast();

  const handleComingSoon = () => {
    toast({ title: 'Coming Soon!', description: 'This feature is under development.' });
  };
  
  const accountItems = [
    { icon: Settings, title: "Settings", subtitle: "APP PREFERENCES & ACCOUNT" },
    { icon: CreditCard, title: "Payment Methods", subtitle: "MANAGE CARDS & BILLING" },
    { icon: Bell, title: "Notifications", subtitle: "BOOKING ALERTS & UPDATES" },
    { icon: Shield, title: "Privacy & Security", subtitle: "DATA & PASSWORD" },
  ];

  return (
    <>
      <ProfileHeader user={user} />
      <StatsCards />

      <div className="my-8">
        <p className="text-sm font-semibold text-muted-foreground tracking-[0.2em] mb-4 text-center">
          ACCOUNT MANAGEMENT
        </p>
        <div className="space-y-3">
          {accountItems.map((item) => (
            <AccountRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              onClick={handleComingSoon}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ProfilePageContent() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    return authUser && firestore ? doc(firestore, 'users', authUser.uid) : null;
  }, [authUser, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ role: string }>(userProfileRef);

  React.useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.replace('/auth?redirect=/profile');
    }
  }, [authUser, isUserLoading, router]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    router.replace('/'); // Navigate away from pages with listeners first

    setTimeout(async () => {
      try {
        const auth = getAuth();
        await signOut(auth);
        toast({ title: "You've been signed out." });
        // The router.replace('/') already handles navigation
      } catch (error) {
        toast({ variant: 'destructive', title: 'Logout Failed', description: 'Something went wrong.' });
      } finally {
        setIsLoggingOut(false);
      }
    }, 100);
  };

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine which profile to show. Default to 'player' if role is not set.
  const isOwner = userProfile?.role === 'owner';

  return (
    <div className="bg-background min-h-screen">
      <Header showLocation={false} />
      <main className="container max-w-2xl mx-auto px-4 py-8">

        <ProfileHeader user={authUser} />
        {isOwner && <OwnerDashboardBanner />}
        <StatsCards />

        <div className="my-8">
            <p className="text-sm font-semibold text-muted-foreground tracking-[0.2em] mb-4 text-center">ACCOUNT MANAGEMENT</p>
            <div className="space-y-3">
                 {[
                    { icon: Settings, title: "Settings", subtitle: "APP PREFERENCES & ACCOUNT" },
                    { icon: CreditCard, title: "Payment Methods", subtitle: "MANAGE CARDS & BILLING" },
                    { icon: Bell, title: "Notifications", subtitle: "BOOKING ALERTS & UPDATES" },
                    { icon: Shield, title: "Privacy & Security", subtitle: "DATA & PASSWORD" },
                ].map(item => (
                     <AccountRow 
                        key={item.title} 
                        icon={item.icon} 
                        title={item.title} 
                        subtitle={item.subtitle}
                        onClick={() => toast({ title: 'Coming Soon!'})}
                    />
                ))}
            </div>
        </div>

        <div className="mt-12">
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl text-base font-bold text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
            SIGN OUT
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfilePageContent />;
}
