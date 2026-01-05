'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from "firebase/auth";
import { Separator } from '@/components/ui/separator';
import { collection, query, where } from 'firebase/firestore';
import type { Court } from '@/lib/types';
import CourtCard from '@/components/court-card';

function ProfilePageContent() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/auth?redirect=/profile');
    }
  }, [user, isUserLoading, router]);

  const favoritesQuery = useMemoFirebase(
    () => (firestore && user) ? query(collection(firestore, `users/${user.uid}/favorites`)) : null,
    [firestore, user]
  );
  const { data: favoriteRelations, isLoading: isLoadingFavorites } = useCollection<{courtId: string}>(favoritesQuery);
  const courtIds = React.useMemo(() => favoriteRelations?.map(f => f.courtId) || [], [favoriteRelations]);
  
  const courtsQuery = useMemoFirebase(() => {
    if (!firestore || courtIds.length === 0) return null;
    return query(collection(firestore, 'courts'), where('id', 'in', courtIds));
  }, [firestore, courtIds]);

  const { data: favoriteCourts, isLoading: isLoadingCourts } = useCollection<Court>(courtsQuery);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Header />
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {user.displayName || 'User'}!</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          </div>
          <Separator />
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">My Favorites</h2>
             {(isLoadingFavorites || isLoadingCourts) ? (
              <p>Loading favorites...</p>
            ) : favoriteCourts && favoriteCourts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoriteCourts.map(court => (
                  <CourtCard key={court.id} court={court} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg mt-8">
                <h2 className="text-xl font-semibold">No Favorites Yet</h2>
                <p className="text-muted-foreground mt-2">
                  Tap the heart icon on a court to save it here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}


export default function ProfilePage() {
    return <ProfilePageContent />;
}
