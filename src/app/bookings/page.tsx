'use client';

import React, { useMemo } from 'react';
import { useRouter }d from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, where, Timestamp } from 'firebase/firestore';
import { format, isFuture, isToday, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, Trash2, Tag, Loader2, Info } from 'lucide-react';
import Header from '@/components/layout/header';
import { useToast } from '@/hooks/use-toast';

type Booking = {
  id: string;
  courtId: string;
  courtName: string; // Denormalized for easy display
  dateKey: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationHours: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Timestamp;
};

const EmptyBookingsState = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center text-center mt-16">
      <div className="w-full max-w-sm p-10 border-2 border-dashed rounded-3xl">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-sm font-bold text-muted-foreground tracking-[0.2em] mb-4">
          NO UPCOMING BOOKINGS
        </h2>
        <Button
          size="lg"
          className="h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
          onClick={() => router.push('/')}
        >
          Book a Court
        </Button>
      </div>
    </div>
  );
};

const BookingCard = ({ booking, onCancel }: { booking: Booking, onCancel: (id: string) => void }) => {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <Card className="w-full max-w-md overflow-hidden rounded-2xl shadow-sm border-gray-200 relative">
      <div className="absolute top-0 right-0 h-20 w-20">
         <div className="absolute top-[-40px] right-[-40px] h-20 w-20 rounded-full bg-primary/10"></div>
      </div>
       <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 bg-primary/20 text-primary-dark font-bold px-3 py-1 rounded-full">
        <Tag className="h-4 w-4 text-primary"/>
        <span className="text-primary text-sm">₱{booking.totalPrice}</span>
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold pr-20">{booking.courtName || 'Court'}</h3>
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="h-4 w-4" />
            <span className="font-semibold text-sm tracking-wider">
              {format(parseISO(booking.dateKey), 'MMMM d, yyyy').toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="h-4 w-4" />
            <span className="font-semibold text-sm tracking-wider">
              {booking.startTime} ({booking.durationHours}H)
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => router.push(`/courts/${booking.courtId}`)}>
            View Court
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel your booking permanently. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Back</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => onCancel(booking.id)}
                >
                  Yes, Cancel Booking
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </CardContent>
    </Card>
  );
};


export default function BookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/auth?redirect=/bookings&mode=login');
    }
  }, [user, isUserLoading, router]);

  const bookingsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, `users/${user.uid}/bookings`),
            orderBy('dateKey', 'asc'),
            orderBy('startTime', 'asc')
          )
        : null,
    [firestore, user]
  );
  
  const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

  const upcomingBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(b => {
      const bookingDate = parseISO(b.dateKey);
      return b.status !== 'cancelled' && (isToday(bookingDate) || isFuture(bookingDate));
    });
  }, [bookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!user || !firestore) return;
    const bookingRef = doc(firestore, `users/${user.uid}/bookings`, bookingId);
    try {
      await updateDoc(bookingRef, { status: 'cancelled' });
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been successfully cancelled.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cancellation Failed',
        description: 'Could not cancel the booking. Please try again.',
      });
    }
  };

  const isLoading = isUserLoading || isLoadingBookings;

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header showLocation={false}/>
      <main className="container max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-sm font-bold text-muted-foreground tracking-[0.2em] mt-1">
            {upcomingBookings.length} UPCOMING SESSIONS
        </p>

        {upcomingBookings.length === 0 ? (
            <EmptyBookingsState />
        ) : (
          <div className="space-y-6 mt-8">
            {upcomingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} onCancel={handleCancelBooking} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
