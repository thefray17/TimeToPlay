'use client';

import React, { useMemo } from 'react';
import Header from '@/components/layout/header';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import CourtCard from '@/components/court-card';
import type { Court } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const favoritesQuery = useMemoFirebase(
    () => (firestore && user) ? query(collection(firestore, `users/${user.uid}/favorites`)) : null,
    [firestore, user]
  );

  const { data: favoriteRelations, isLoading: isLoadingFavorites } = useCollection<{courtId: string}>(favoritesQuery);

  const courtIds = useMemoFirebase(() => favoriteRelations?.map(f => f.courtId), [favoriteRelations]);

  const courtsQuery = useMemoFirebase(() => {
    if (!firestore || !courtIds || courtIds.length === 0) return null;
    return query(collection(firestore, 'courts'));
    // In a real app, you'd use a `where('id', 'in', courtIds)` query.
    // Firestore's 'in' operator is limited to 30 items, so for larger lists,
    // you'd fetch documents individually or use a different data model.
    // For this demo, we fetch all courts and filter client-side.
  }, [firestore, courtIds]);

  const { data: courts, isLoading: isLoadingCourts } = useCollection<Court>(courtsQuery);

  const favoriteCourts = useMemo(() => {
    if (!courts || !courtIds) return [];
    return courts.filter(c => courtIds.includes(c.id));
  }, [courts, courtIds]);

  if (isUserLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    router.push('/profile');
    return null;
  }

  return (
    <>
      <Header />
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
        {(isLoadingFavorites || isLoadingCourts) ? (
          <p>Loading favorites...</p>
        ) : favoriteCourts.length > 0 ? (
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
      </main>
    </>
  );
}
