
'use client';

import React, { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, Timestamp, runTransaction } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Check, X, User, Calendar, Clock } from 'lucide-react';
import { format, parse } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { getHourSlotsInRange } from '@/lib/time-utils';

type Booking = {
  id: string;
  courtId: string;
  courtName: string;
  userId: string;
  userName: string;
  userEmail: string;
  dateKey: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: Timestamp;
};

const BookingRequestCard = ({ booking, onUpdate }: { booking: Booking; onUpdate?: (booking: Booking, status: 'accepted' | 'declined') => void; }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (status: 'accepted' | 'declined') => {
    if(!onUpdate) return;
    setIsLoading(true);
    await onUpdate(booking, status);
    setIsLoading(false);
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{booking.courtName}</CardTitle>
        <CardDescription>
          {format(parse(booking.dateKey, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')} @ {timeRange}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>{booking.userName} ({booking.userEmail})</span>
        </div>
         <div className="font-bold text-lg">
            Total: ₱{booking.totalPrice}
        </div>
        {booking.status === 'pending' && (
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => handleUpdate('declined')} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" /> Decline
            </Button>
            <Button size="sm" onClick={() => handleUpdate('accepted')} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
              Accept
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


const BookingsList = ({ bookings, onUpdate }: { bookings: Booking[], onUpdate?: (booking: Booking, status: 'accepted' | 'declined') => void; }) => {
  if (bookings.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No bookings in this category.</p>;
  }

  return (
    <div className="space-y-4">
      {bookings.map(booking => (
        <BookingRequestCard key={booking.id} booking={booking} onUpdate={onUpdate} />
      ))}
    </div>
  );
};


export default function OwnerBookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('pending');

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/auth?redirect=/owner/bookings');
    }
  }, [isUserLoading, user, router]);


  const bookingsQuery = useMemoFirebase(
    () =>
      firestore && user?.uid
        ? query(
            collection(firestore, 'bookings'),
            where('ownerId', '==', user.uid)
          )
        : null,
    [firestore, user?.uid]
  );

  const { data: allBookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);
  
  const sortedBookings = useMemo(() => {
    const list = allBookings ?? [];
    return [...list].sort((a, b) => {
      const aKey = `${a.dateKey} ${a.startTime}`;
      const bKey = `${b.dateKey} ${b.startTime}`;
      return aKey.localeCompare(bKey);
    });
  }, [allBookings]);

  const handleUpdateStatus = async (booking: Booking, status: 'accepted' | 'declined') => {
    if (!firestore || !user) return;
    try {
      await runTransaction(firestore, async (transaction) => {
        const bookingRef = doc(firestore, 'bookings', booking.id);
        
        if (status === 'accepted') {
            transaction.update(bookingRef, { status: 'accepted' });
        } else if (status === 'declined') {
            // --- 1) READS FIRST ---
            const slotIds = getHourSlotsInRange(booking.startTime, booking.durationHours);
            const lockRefs = slotIds.map((slotId) =>
                doc(firestore, "courts", booking.courtId, "availability", booking.dateKey, "locks", slotId)
            );
            
            // Read all lock documents before any writes
            const lockSnaps = await Promise.all(lockRefs.map((ref) => transaction.get(ref)));
            
            const locksToDelete = lockRefs.filter((_, i) => {
                const snap = lockSnaps[i];
                // Ensure lock exists and belongs to this booking before deleting
                return snap.exists() && snap.data()?.bookingId === booking.id;
            });

            // --- 2) WRITES AFTER ---
            transaction.update(bookingRef, { status: 'declined' });
            
            for (const ref of locksToDelete) {
                transaction.delete(ref);
            }
        }
      });


      toast({
        title: `Booking ${status}`,
        description: `The booking has been successfully ${status}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Could not update the booking status.',
      });
    }
  };
  
  const filteredBookings = (status: Booking['status']) => sortedBookings.filter(b => b.status === status);

  const isLoading = isUserLoading || isLoadingBookings;

  if (isLoading || !user) {
     return (
        <div className="flex justify-center mt-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled by User</TabsTrigger>
        </TabsList>

        {isLoadingBookings ? (
             <div className="flex justify-center mt-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ): (
            <>
                <TabsContent value="pending">
                    <BookingsList bookings={filteredBookings('pending')} onUpdate={handleUpdateStatus} />
                </TabsContent>
                <TabsContent value="accepted">
                     <BookingsList bookings={filteredBookings('accepted')} />
                </TabsContent>
                <TabsContent value="declined">
                     <BookingsList bookings={filteredBookings('declined')} />
                </TabsContent>
                 <TabsContent value="cancelled">
                     <BookingsList bookings={filteredBookings('cancelled')} />
                </TabsContent>
            </>
        )}
      </Tabs>
    </div>
  );
}
