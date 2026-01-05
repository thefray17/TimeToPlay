'use client';

import React from 'react';
import Header from '@/components/layout/header';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

type Booking = {
  id: string;
  courtId: string;
  dateKey: string;
  startTime: string;
  durationHours: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: { seconds: number; nanoseconds: number };
};

export default function BookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const bookingsQuery = useMemoFirebase(
    () => (firestore && user) ? query(collection(firestore, `users/${user.uid}/bookings`), orderBy('createdAt', 'desc')) : null,
    [firestore, user]
  );
  
  const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

  const handleCancelBooking = async (bookingId: string) => {
    if (!user || !firestore) return;
    const bookingRef = doc(firestore, `users/${user.uid}/bookings`, bookingId);
    await updateDoc(bookingRef, { status: 'cancelled' });
  };

  const renderBookings = (status: Booking['status']) => {
    const filteredBookings = bookings?.filter(b => b.status === status);
    if (!filteredBookings || filteredBookings.length === 0) {
      return <p className="text-muted-foreground">No {status} bookings.</p>;
    }
    return filteredBookings.map(booking => (
      <Card key={booking.id} className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Booking for {format(new Date(booking.dateKey), 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Time: {booking.startTime}</p>
          <p>Duration: {booking.durationHours}hr</p>
          <p>Total: ₱{booking.totalPrice}</p>
        </CardContent>
        {status === 'pending' && (
           <CardFooter>
            <Button variant="destructive" onClick={() => handleCancelBooking(booking.id)}>Cancel</Button>
           </CardFooter>
        )}
      </Card>
    ));
  };
  
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
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        
        {isLoadingBookings ? (
          <p>Loading bookings...</p>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                <Badge>Pending</Badge>
              </h2>
              {renderBookings('pending')}
            </div>
            <Separator />
            <div>
              <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                <Badge variant="secondary">Confirmed</Badge>
              </h2>
               {renderBookings('confirmed')}
            </div>
             <Separator />
            <div>
              <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                 <Badge variant="destructive">Cancelled</Badge>
              </h2>
               {renderBookings('cancelled')}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
