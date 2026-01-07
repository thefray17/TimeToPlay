'use client';

import React, { Suspense } from 'react';
import Header from '@/components/layout/header';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';

const CheckoutSummary = () => {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const { user } = useUser();
    const firestore = useFirestore();

    // Global bookings collection query
    const bookingRef = useMemoFirebase(
      () => (firestore && bookingId) ? doc(firestore, `bookings`, bookingId) : null,
      [firestore, bookingId]
    );

    const { data: booking, isLoading } = useDoc(bookingRef);

    // Authorization check
    if (!isLoading && booking && user && booking.userId !== user.uid) {
      return (
         <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground max-w-md mb-8">
              You do not have permission to view this booking.
            </p>
              <Link href="/" passHref>
                <Button size="lg">Explore Courts</Button>
            </Link>
        </div>
      )
    }

    if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h1 className="text-3xl font-bold mb-4">Finalizing Booking...</h1>
          </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-bold mb-4">Booking Not Found</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                We couldn't find the details for this booking. It might have been cancelled or there was an error.
                </p>
                 <Link href="/" passHref>
                    <Button size="lg">Explore Courts</Button>
                </Link>
            </div>
        );
    }
    
    const startTime = booking.startTime;
    const endTime = booking.endTime;
    const dateDisplay = format(parseISO(booking.dateKey), 'EEEE, MMMM d, yyyy');

    return (
        <>
            <CheckCircle className="h-24 w-24 text-primary mb-6" />
            <h1 className="text-3xl font-bold mb-4">Booking Pending!</h1>
            <p className="text-muted-foreground max-w-md">
                Your court time is pending confirmation from the owner. You will be notified once it's accepted.
            </p>
            
            <div className="w-full max-w-md text-left border rounded-xl p-6 mt-8 space-y-4 bg-secondary/50">
                <div>
                    <p className="text-sm text-muted-foreground">Court</p>
                    <p className="font-bold text-lg">{booking.courtName}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-bold">{dateDisplay}</p>
                    <p className="font-bold">{startTime} – {endTime} ({booking.durationHours}hr)</p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="font-bold text-lg">₱{booking.totalPrice}</p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <p className="font-mono text-xs">{booking.id}</p>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <Link href="/bookings" passHref>
                    <Button size="lg">View My Bookings</Button>
                </Link>
                <Link href="/" passHref>
                    <Button size="lg" variant="outline">Explore More Courts</Button>
                </Link>
            </div>
        </>
    );
};


export default function CheckoutPage() {
  return (
    <>
      <Header showLocation={false}/>
      <main className="container max-w-lg mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Suspense fallback={<Loader2 className="h-16 w-16 animate-spin text-primary" />}>
            <CheckoutSummary />
        </Suspense>
      </main>
    </>
  );
}
