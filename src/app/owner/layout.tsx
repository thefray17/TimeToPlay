'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import OwnerNav from '@/components/layout/owner-nav';
import Header from '@/components/layout/header';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    return user && firestore ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ role: string }>(userProfileRef);

  useEffect(() => {
    // If not loading and user is not authenticated, redirect to login
    if (!isUserLoading && !user) {
      router.replace('/auth?redirect=/owner');
    }
    // If user is loaded and profile is loaded but user is not an owner, redirect away
    if (!isUserLoading && !isProfileLoading && userProfile && userProfile.role !== 'owner') {
      router.replace('/');
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  // Show a loading screen while verifying auth and role
  if (isUserLoading || isProfileLoading || !userProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is verified as an owner, render the layout
  if (userProfile.role === 'owner') {
    return (
      <div className="flex min-h-screen bg-muted/40">
        <OwnerNav />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
