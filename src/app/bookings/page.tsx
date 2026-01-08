
'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, runTransaction, where } from 'firebase/firestore';
import { format, parse, addHours } from 'date-fns';
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
import { Calendar, Clock, Trash2, Tag, Loader2 } from 'lucide-react';
import Header from '@/components/layout/header';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getHourSlotsInRange } from '@/lib/time-utils';
import { Separator } from '@/components/ui/separator';

type Booking = {
  id: string;
  courtId: string;
  ownerId: string;
  courtName: string;
  dateKey: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'confirmed' | 'declined' | 'cancelled';
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

const BookingCard = ({ booking, onCancel }: { booking: Booking; onCancel: (booking: Booking) => void }) => {
  const router = useRouter();
  const isCancellable = booking.status === 'pending' || booking.status === 'accepted' || booking.status === 'confirmed';

  const isAccepted = booking.status === 'accepted' || booking.status === 'confirmed';

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    confirmed: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const timeRange = useMemo(() => {
    try {
      const start = parse(booking.startTime, 'HH:mm', new Date());
      const end = parse(booking.endTime, 'HH:mm', new Date());
      const startTime12hr = format(start, 'h:mm a');
      const endTime12hr = format(end, 'h:mm a');
      return `${startTime12hr} - ${endTime12hr}`;
    } catch (e) {
      return `${booking.startTime} - ${booking.endTime}`;
    }
  }, [booking.startTime, booking.endTime]);

  return (
    <Card className="w-full max-w-md overflow-hidden rounded-2xl shadow-sm border-gray-200 relative">
      <div className="absolute top-0 right-0 h-20 w-20">
        <div className="absolute top-[-40px] right-[-40px] h-20 w-20 rounded-full bg-primary/10"></div>
      </div>
      {booking.totalPrice > 0 && (
         <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 bg-primary/20 text-primary-dark font-bold px-3 py-1 rounded-full">
            <Tag className="h-4 w-4 text-primary" />
            <span className="text-primary text-sm">₱{booking.totalPrice}</span>
        </div>
      )}


      <CardContent className="p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold pr-20">{booking.courtName || 'Court'}</h3>
            <Badge className={cn('capitalize', statusColors[booking.status])}>{isAccepted ? 'Accepted' : booking.status}</Badge>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="h-4 w-4" />
            <span className="font-semibold text-sm tracking-wider">
              {format(parse(booking.dateKey, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy').toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="h-4 w-4" />
            <span className="font-semibold text-sm tracking-wider">
              {timeRange}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => router.push(`/courts/${booking.courtId}`)}>
            View Court
          </Button>

          {isCancellable && (
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
                    onClick={() => onCancel(booking)}
                  >
                    Yes, Cancel Booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
      firestore && user?.uid
        ? query(collection(firestore, 'bookings'), where('userId', '==', user.uid))
        : null,
    [firestore, user?.uid]
  );

  const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

  const { upcomingBookings, pastBookings } = useMemo(() => {
    if (!bookings) return { upcomingBookings: [], pastBookings: [] };

    const now = new Date();

    const toStart = (b: Booking) => {
      // supports "HH:mm" or "h:mm a"
      const dt24 = parse(`${b.dateKey} ${b.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      if (!isNaN(dt24.getTime())) return dt24;
  
      const dt12 = parse(`${b.dateKey} ${b.startTime}`, 'yyyy-MM-dd h:mm a', new Date());
      return dt12;
    };

    const isOver = (b: Booking) => {
      const start = toStart(b);
      if (isNaN(start.getTime())) return false; // don't accidentally hide
      const end = addHours(start, Number(b.durationHours || 1));
      return end <= now;
    };

    const isAccepted = (s: string) => s === 'confirmed' || s === 'accepted';

    // Upcoming = pending OR accepted/confirmed that is not over yet
    const upcoming = bookings.filter((b) => {
      if (!(b.status === "pending" || isAccepted(b.status))) return false;
      return !isOver(b);
    });

    // History = declined OR accepted/confirmed that is already over
    const past = bookings.filter((b) => {
      if (b.status === 'declined') return true;
      if (isAccepted(b.status)) return isOver(b);
      return false; // excludes cancelled + pending
    });

    // optional: newest first
    const sortKey = (b: Booking) => `${b.dateKey} ${b.startTime}`;
    upcoming.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    past.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));

    return { upcomingBookings: upcoming, pastBookings: past };
  }, [bookings]);

  const handleCancelBooking = async (booking: Booking) => {
    if (!user || !firestore) return;

    try {
      await runTransaction(firestore, async (transaction) => {
        const bookingRef = doc(firestore, 'bookings', booking.id);
        
        const bookingSnap = await transaction.get(bookingRef);
        if (!bookingSnap.exists()) {
          console.log('Booking already cancelled or does not exist.');
          return;
        }

        const bookingData = bookingSnap.data() as Booking;
        const { courtId, dateKey, startTime, durationHours } = bookingData;
        
        const slotIds = getHourSlotsInRange(startTime, durationHours);
        const lockRefs = slotIds.map(slotId => 
          doc(firestore, 'courts', courtId, 'availability', dateKey, 'locks', slotId)
        );
        
        const lockSnaps = await Promise.all(lockRefs.map(ref => transaction.get(ref)));

        lockSnaps.forEach((lockSnap, index) => {
          if (lockSnap.exists() && lockSnap.data()?.userId === user.uid) {
            transaction.delete(lockRefs[index]);
          }
        });

        transaction.update(bookingRef, { status: 'cancelled' });
      });

      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been successfully cancelled and the slot is now free.',
      });

    } catch (error: any) {
      console.error("Cancellation transaction failed:", error);
      toast({
        variant: 'destructive',
        title: 'Cancellation Failed',
        description: error.message || 'Could not cancel the booking. Please try again.',
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
      <Header showLocation={false} />
      <main className="container max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-sm font-bold text-muted-foreground tracking-[0.2em] mt-1">
          {upcomingBookings.length} UPCOMING SESSIONS
        </p>

        {upcomingBookings.length === 0 && !isLoading ? (
          <EmptyBookingsState />
        ) : (
          <div className="space-y-6 mt-8">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onCancel={handleCancelBooking} />
            ))}
          </div>
        )}
        
        <div className="mt-12">
            <Separator />
            <h2 className="text-lg font-bold text-center my-6 text-muted-foreground">Booking History</h2>
            {pastBookings.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                    No completed or declined bookings yet.
                </div>
            ) : (
                <div className="space-y-6">
                    {pastBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} onCancel={handleCancelBooking} />
                    ))}
                </div>
            )}
        </div>
      </main>
    </>
  );
}
