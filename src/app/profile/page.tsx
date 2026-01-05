'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/auth/login-form';
import SignUpForm from '@/components/auth/signup-form';
import { collection, query } from 'firebase/firestore';
import CourtCard from '@/components/court-card';
import type { Court } from '@/lib/types';
import { getAuth, signOut } from "firebase/auth";

const FavoritesList = () => {
  const { user } = useUser();
  const firestore = useFirestore();

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

  if (isLoadingFavorites || isLoadingCourts) {
    return <p>Loading favorites...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mt-8 mb-4">My Favorites</h2>
      {favoriteCourts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favoriteCourts.map(court => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      ) : (
        <p>You haven't favorited any courts yet.</p>
      )}
    </div>
  );
};


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Header />
      <main className="container max-w-5xl mx-auto px-4 py-8">
        {user ? (
          <div>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Welcome!</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>
            <FavoritesList />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-bold mb-4">Login</h2>
              <LoginForm />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
              <SignUpForm />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
