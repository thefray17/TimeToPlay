
'use client';

import React, { useState, useMemo, useCallback, Suspense } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  DollarSign,
  Clock,
  Calendar,
  Minus,
  Plus,
  Navigation,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { add, format, parseISO } from 'date-fns';
import AlternativeCourtsDialog from '@/components/alternative-courts-dialog';
import type { Court } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, deleteDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';

const availableTimeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];


const HeroHeader = ({ court, isFavorite, onToggleFavorite }: { court: Court; isFavorite: boolean; onToggleFavorite: () => void; }) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: court.name,
      text: `Check out ${court.name} on CourtFind!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link Copied!', description: 'Court URL copied to your clipboard.' });
    }
  };

  return (
    <div className="relative h-64 md:h-80 w-full">
      <Image
        src={court.heroImageUrl}
        alt={court.name}
        fill
        style={{ objectFit: 'cover' }}
        className="bg-gray-200"
        data-ai-hint={court.imageHint}
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute top-4 left-4">
        <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm" onClick={onToggleFavorite}>
          <Heart className={cn("h-5 w-5", isFavorite && 'fill-red-500 text-red-500')} />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

const CourtMetaRow = ({ court }: { court: Court }) => (
  <div className="flex justify-between items-start -mt-12 relative z-10 px-4 md:px-0">
    <div>
      <Badge className="mb-2">{court.sport}</Badge>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{court.name}</h1>
      <div className="flex items-center text-muted-foreground mt-2">
        <MapPin className="h-4 w-4 mr-1.5" />
        <span>{court.address}</span>
      </div>
    </div>
    <div className="text-right flex-shrink-0 ml-4">
      <div className="flex items-center justify-end gap-1">
        <p className="text-xl font-bold">{court.rating}</p>
        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
      </div>
      <p className="text-sm text-muted-foreground">{court.reviewsCount} reviews</p>
    </div>
  </div>
);

const InfoCards = ({ court }: { court: Court }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
          <DollarSign className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground tracking-wider">PRICE</p>
          <p className="text-lg font-semibold">₱{court.pricePerHour}/hr</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full">
          <Clock className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground tracking-wider">OPEN</p>
          <p className="text-lg font-semibold">{court.openTime} – {court.closeTime}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AmenityChips = ({ court }: { court: Court }) => (
  <div className="flex flex-wrap gap-2 mt-4">
    {court.amenities.map((amenity) => (
      <Badge key={amenity.name} variant="outline" className="text-sm py-1 px-3">
        {amenity.name}
      </Badge>
    ))}
  </div>
);

const DaySelector = ({ selectedDate, onDateChange }: { selectedDate: Date, onDateChange: (date: Date) => void }) => {
  const { toast } = useToast();
  const days = [0, 1, 2].map(i => add(new Date(), { days: i }));
  
  return (
    <div className="flex items-center gap-2">
      {days.map(day => (
        <Button
          key={day.toISOString()}
          variant={format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ? 'default' : 'outline'}
          className="flex flex-col h-auto px-4 py-2 rounded-lg"
          onClick={() => onDateChange(day)}
        >
          <span className="text-xs uppercase">{format(day, 'EEE')}</span>
          <span className="text-lg font-bold">{format(day, 'd')}</span>
        </Button>
      ))}
      <Button variant="outline" className="flex flex-col h-auto px-4 py-2 rounded-lg border-dashed" onClick={() => toast({ title: 'Coming soon!'})}>
        <Calendar className="h-4 w-4 mb-1" />
        <span className="text-xs">MORE</span>
      </Button>
    </div>
  );
};


const DurationStepper = ({ duration, onDurationChange }: { duration: number, onDurationChange: (duration: number) => void }) => {
  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="font-semibold">DURATION</p>
        <p className="text-sm text-muted-foreground">How many hours?</p>
      </div>
      <div className="flex items-center gap-2 p-1 rounded-full border">
        <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={() => onDurationChange(Math.max(1, duration - 1))} disabled={duration <= 1}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-6 text-center font-bold">{duration}</span>
        <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={() => onDurationChange(Math.min(6, duration + 1))} disabled={duration >= 6}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const TimeGrid = ({ selectedDate, duration, selectedTime, onTimeSelect, court, availability, isLoading }: { selectedDate: Date; duration: number, selectedTime: string | null, onTimeSelect: (time: string | null) => void, court: Court, availability: { unavailableTimes: string[] } | null, isLoading: boolean }) => {
  
  const isSlotAvailable = useCallback((time: string) => {
    if (!availability) return true; // Assume available if no data yet, it will be disabled by the loading state
    const startHour = parseInt(time.split(':')[0], 10);
    const closeHour = parseInt(court.closeTime.split(':')[0], 10);

    for (let i = 0; i < duration; i++) {
      const checkHour = startHour + i;
      const checkTime = `${String(checkHour).padStart(2, '0')}:00`;
      if (availability.unavailableTimes.includes(checkTime) || checkHour >= closeHour) {
        return false;
      }
    }
    return true;
  }, [duration, availability, court.closeTime]);
  
  if (isLoading) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-muted animate-pulse rounded-md" />
            ))}
        </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
      {availableTimeSlots.map(time => {
        const isAvailable = isSlotAvailable(time);
        const isSelected = selectedTime === time;

        return (
          <Button
            key={time}
            variant={isSelected ? 'default' : 'outline'}
            disabled={!isAvailable}
            onClick={() => onTimeSelect(isAvailable ? time : null)}
            className={cn("h-12 text-base", isSelected && "ring-2 ring-primary ring-offset-2")}
          >
            {time}
          </Button>
        );
      })}
    </div>
  );
};

const StickyActionBar = ({ isEnabled, onBook, court, isBooking }: { isEnabled: boolean; onBook: () => void; court: Court, isBooking: boolean }) => {
  const handleShowMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(court.address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 w-full bg-background/80 backdrop-blur-sm border-t py-3 pb-safe z-20">
      <div className="container max-w-5xl mx-auto flex items-center justify-between gap-4">
        <Button variant="outline" className="h-12 w-auto px-6" onClick={handleShowMap}>
          <Navigation className="h-5 w-5 mr-2" /> Maps
        </Button>
        <Button className="h-12 flex-1" disabled={!isEnabled || isBooking} onClick={onBook}>
          {isBooking ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Book Now'}
        </Button>
      </div>
    </div>
  );
};


const CourtDetailsContent = ({ courtId }: { courtId: string }) => {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [duration, setDuration] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isAlternativesDialogOpen, setAlternativesDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const courtRef = useMemoFirebase(() => (firestore && courtId) ? doc(firestore, 'courts', courtId) : null, [firestore, courtId]);
  const { data: court, isLoading: isCourtLoading } = useDoc<Court>(courtRef);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const availabilityRef = useMemoFirebase(() => courtRef ? doc(courtRef, 'availability', dateKey) : null, [courtRef, dateKey]);
  const { data: availability, isLoading: isAvailabilityLoading } = useDoc<{ unavailableTimes: string[] }>(availabilityRef);

  const favoriteRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, `users/${user.uid}/favorites`, courtId) : null, [firestore, user, courtId]);
  const { data: favorite } = useDoc(favoriteRef);
  const isFavorite = !!favorite;
  
  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/auth?redirect=' + encodeURIComponent(`/courts/${courtId}`));
      return;
    }
    if (!favoriteRef) return;

    if (isFavorite) {
      await deleteDoc(favoriteRef);
      toast({ title: 'Removed from favorites' });
    } else {
      await setDoc(favoriteRef, {
        courtId: courtId,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Added to favorites!' });
    }
  };
  
  const handleTimeSelect = (time: string | null) => {
    if (time) {
      setSelectedTime(time);
    } else {
      setAlternativesDialogOpen(true);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    setSelectedTime(null);
  };

  const handleBookNow = async () => {
    if (!court || !selectedTime) return;
    setIsBooking(true);

    if (!user) {
      const pendingBooking = {
        courtId: court.id,
        dateKey: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        durationHours: duration,
      };
      localStorage.setItem('cf_pending_booking', JSON.stringify(pendingBooking));
      router.push('/auth?redirect=' + encodeURIComponent(`/courts/${court.id}`));
      return;
    }
    
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database connection not found.' });
      setIsBooking(false);
      return;
    }

    const bookingId = nanoid();
    const startTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}`);
    const endTime = add(startTime, { hours: duration });

    // Player's copy of the booking
    const bookingData = {
      id: bookingId,
      userId: user.uid,
      ownerId: court.ownerId,
      courtId: court.id,
      courtName: court.name,
      userName: user.displayName,
      userEmail: user.email,
      dateKey: format(selectedDate, 'yyyy-MM-dd'),
      startTime: selectedTime,
      durationHours: duration,
      endTime: format(endTime, 'HH:mm'),
      totalPrice: (court.pricePerHour || 0) * duration,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
    };
    
    try {
      // 1. Write booking to player's subcollection
      const playerBookingRef = doc(firestore, `users/${user.uid}/bookings`, bookingId);
      await setDoc(playerBookingRef, bookingData);
      
      // 2. Write mirrored booking to owner's subcollection
      const ownerBookingRef = doc(firestore, `users/${court.ownerId}/owner_bookings`, bookingId);
      await setDoc(ownerBookingRef, bookingData);
      
      // 3. Update court availability
      const availabilityDocRef = doc(firestore, `courts/${court.id}/availability`, bookingData.dateKey);
      const availabilityDoc = await getDoc(availabilityDocRef);
      const newUnavailableTimes = [];
      for(let i=0; i<duration; i++) {
        const hour = parseInt(selectedTime.split(':')[0]) + i;
        newUnavailableTimes.push(`${String(hour).padStart(2, '0')}:00`);
      }

      if (availabilityDoc.exists()) {
        const currentUnavailable = availabilityDoc.data().unavailableTimes || [];
        await setDoc(availabilityDocRef, {
            unavailableTimes: [...currentUnavailable, ...newUnavailableTimes]
        }, { merge: true });
      } else {
         await setDoc(availabilityDocRef, { unavailableTimes: newUnavailableTimes });
      }
      
      router.push(`/checkout?bookingId=${bookingId}`);
    } catch(e: any) {
        toast({
            variant: "destructive",
            title: "Booking Failed",
            description: e.message || "Could not create your booking. Please try again."
        });
        setIsBooking(false);
    }
  };

  const isBookingEnabled = selectedTime !== null;
  
  const formattedDateLabel = useMemo(() => {
    return format(selectedDate, 'MMM d, yyyy').toUpperCase();
  }, [selectedDate]);

  if (isCourtLoading || isUserLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!court) {
    return <div className="flex items-center justify-center h-screen">Court not found.</div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <HeroHeader court={court} isFavorite={isFavorite} onToggleFavorite={handleToggleFavorite} />

      <main className="container max-w-5xl mx-auto px-4 pb-32">
        <CourtMetaRow court={court} />
        <InfoCards court={court} />
        <Separator className="my-8" />
        <div className="px-4 md:px-0">
          <h2 className="text-xl font-bold tracking-tight">About</h2>
          <p className="mt-2 text-muted-foreground">{court.description}</p>
          <AmenityChips court={court} />
        </div>
        <Separator className="my-8" />

        <div className="px-4 md:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-tight">Availability</h2>
            <p className="text-sm font-semibold text-primary">{formattedDateLabel}</p>
          </div>
          <DaySelector selectedDate={selectedDate} onDateChange={handleDateChange} />
          
          <div className="mt-8">
            <DurationStepper duration={duration} onDurationChange={handleDurationChange} />
          </div>

          <div className="mt-6">
            <TimeGrid 
              selectedDate={selectedDate} 
              duration={duration} 
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelect}
              court={court}
              availability={availability}
              isLoading={isAvailabilityLoading}
            />
          </div>
        </div>
      </main>

      <StickyActionBar 
        isEnabled={isBookingEnabled}
        onBook={handleBookNow}
        court={court}
        isBooking={isBooking}
      />
      
      {court && (
        <AlternativeCourtsDialog
          open={isAlternativesDialogOpen}
          onOpenChange={setAlternativesDialogOpen}
          preferredCourt={court}
          searchDate={format(selectedDate, 'yyyy-MM-dd')}
          searchTime={selectedTime || '12:00'}
        />
      )}
    </div>
  );
}


export default function CourtDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <CourtDetailsContent courtId={id} />
    </Suspense>
  )
}
