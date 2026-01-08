
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
  Navigation,
  Loader2,
  Info,
  Calendar as CalendarIcon,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { add, format, parseISO, startOfDay, differenceInMinutes, addMinutes, isSameDay } from 'date-fns';
import AlternativeCourtsDialog from '@/components/alternative-courts-dialog';
import type { Court } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, deleteDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { timeToMinutes, getBlockedIntervals } from '@/lib/time-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';


const availableDurations = [1, 2, 3, 4, 5, 6, 7, 8]; // up to 8 hours

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
    const today = startOfDay(new Date());
    const baseDays = [0, 1, 2, 3, 4].map(i => add(today, { days: i }));

    const isCustomDate = !baseDays.some(d => isSameDay(d, selectedDate));

    const displayedDays = isCustomDate ? [...baseDays.slice(0, 4), selectedDate] : baseDays;
    displayedDays.sort((a,b) => a.getTime() - b.getTime());

    const handleSelectDateFromCalendar = (date?: Date) => {
        if (date) {
            onDateChange(startOfDay(date));
        }
    };
  
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {displayedDays.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const isMoreButton = isCustomDate && isSameDay(day, selectedDate);

          return(
            <Button
              key={day.toISOString()}
              variant={isSelected ? 'default' : 'outline'}
              className="flex flex-col h-auto px-4 py-2 rounded-lg flex-shrink-0"
              onClick={() => onDateChange(day)}
            >
              <span className={cn("text-xs uppercase", isMoreButton && "text-primary-foreground/70")}>{isToday ? 'Today' : format(day, 'EEE')}</span>
              <span className="text-lg font-bold">{format(day, 'd')}</span>
            </Button>
          )
        })}
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="flex flex-col h-[62px] w-[62px] px-2 py-2 rounded-lg flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground"/>
                    <span className="text-xs uppercase mt-1">More</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelectDateFromCalendar}
                    initialFocus
                    disabled={(date) => date < today }
                />
            </PopoverContent>
        </Popover>
      </div>
    );
};
  
const DurationSelector = ({ selectedDuration, onDurationChange, validDurations }: { selectedDuration: number, onDurationChange: (duration: number) => void; validDurations: Map<number, { isValid: boolean, reason: string }>}) => {
    const quickDurations = [1, 2, 3, 4];
    const moreDurations = [5, 6, 7, 8];
    const isMoreDurationSelected = moreDurations.includes(selectedDuration);

    return (
        <div className="flex items-center gap-4">
            <div>
                <p className="font-semibold">DURATION</p>
            </div>
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    {quickDurations.map(duration => {
                        const { isValid, reason } = validDurations.get(duration) || { isValid: false, reason: 'N/A' };
                        const isSelected = selectedDuration === duration;
                        return (
                            <Tooltip key={duration}>
                                <TooltipTrigger asChild>
                                    <div className={cn(!isValid && "cursor-not-allowed")}>
                                        <Button
                                            size="sm"
                                            variant={isSelected ? "default" : "outline"}
                                            onClick={() => onDurationChange(duration)}
                                            disabled={!isValid}
                                            className={cn("w-16", isSelected && "ring-2 ring-primary ring-offset-2")}
                                        >
                                            {duration}hr
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {!isValid && <TooltipContent><p>{reason}</p></TooltipContent>}
                            </Tooltip>
                        )
                    })}
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                size="sm"
                                variant={isMoreDurationSelected ? "default" : "outline"}
                                className={cn("w-24", isMoreDurationSelected && "ring-2 ring-primary ring-offset-2")}
                            >
                                {isMoreDurationSelected ? `${selectedDuration}hr` : 'More'} <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                             <div className="grid grid-cols-2 gap-2">
                                {moreDurations.map(duration => {
                                    const { isValid, reason } = validDurations.get(duration) || { isValid: false, reason: 'N/A' };
                                    return (
                                        <Tooltip key={duration}>
                                            <TooltipTrigger asChild>
                                                <div className={cn(!isValid && "cursor-not-allowed")}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onDurationChange(duration)}
                                                        disabled={!isValid}
                                                        className="w-full"
                                                    >
                                                        {duration}hr
                                                    </Button>
                                                </div>
                                            </TooltipTrigger>
                                            {!isValid && <TooltipContent><p>{reason}</p></TooltipContent>}
                                        </Tooltip>
                                    )
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>

                </TooltipProvider>
            </div>
        </div>
    );
};

const TimeGrid = ({ 
    court, 
    selectedTime, 
    onTimeSelect, 
    validStartTimes, 
    isLoading 
}: { 
    court: Court;
    selectedTime: number | null; 
    onTimeSelect: (time: number | null) => void;
    validStartTimes: Map<number, { isValid: boolean, reason: string }>;
    isLoading: boolean;
}) => {
    const timeSlots = useMemo(() => {
        const slots = [];
        const open = timeToMinutes(court.openTime);
        const close = timeToMinutes(court.closeTime);
        for (let t = open; t < close; t += 60) {
            slots.push(t);
        }
        return slots;
    }, [court.openTime, court.closeTime]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-12 w-full bg-muted animate-pulse rounded-md" />
                ))}
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {timeSlots.map(time => {
                    const isSelected = selectedTime === time;
                    const { isValid, reason } = validStartTimes.get(time) || { isValid: false, reason: 'Unknown' };
                    const timeLabel = format(addMinutes(startOfDay(new Date()), time), 'h:mm a');

                    return (
                        <Tooltip key={time}>
                            <TooltipTrigger asChild>
                                <div className={cn(!isValid && "cursor-not-allowed w-full")}>
                                    <Button
                                        variant={isSelected ? 'default' : 'outline'}
                                        disabled={!isValid}
                                        onClick={() => onTimeSelect(isValid ? time : null)}
                                        className={cn("h-12 text-base w-full", isSelected && "ring-2 ring-primary ring-offset-2")}
                                    >
                                        {timeLabel}
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            {!isValid && (
                                <TooltipContent>
                                    <p>{reason}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
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

  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedDuration, setSelectedDuration] = useState(1); // in hours
  const [selectedTime, setSelectedTime] = useState<number | null>(null); // in minutes
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

  const { openTime, closeTime } = court || {};
  const { openMin, closeMin, blockedIntervals } = useMemo(() => {
    if (!court || !openTime || !closeTime) return { openMin: 0, closeMin: 1440, blockedIntervals: [] };
    
    return {
        openMin: timeToMinutes(openTime),
        closeMin: timeToMinutes(closeTime),
        blockedIntervals: getBlockedIntervals(availability?.unavailableTimes || [])
    };
  }, [court, openTime, closeTime, availability]);


  const checkIntervalValidity = useCallback((start: number, duration: number) => {
    const end = start + duration * 60;
    if (end > closeMin) return { isValid: false, reason: `Exceeds closing time of ${closeTime}` };
    for (const interval of blockedIntervals) {
        if (start < interval.end && end > interval.start) {
            const blockedTime = format(addMinutes(startOfDay(new Date()), interval.start), 'h:mm a');
            return { isValid: false, reason: `Overlaps with a ${blockedTime} booking` };
        }
    }
    return { isValid: true, reason: '' };
  }, [closeMin, closeTime, blockedIntervals]);
  
  const validDurations = useMemo(() => {
    const validationMap = new Map<number, { isValid: boolean, reason: string }>();
    if (!selectedTime) { // If no time is selected, all durations are technically valid for selection
        availableDurations.forEach(d => validationMap.set(d, { isValid: true, reason: '' }));
        return validationMap;
    }
    availableDurations.forEach(d => {
        validationMap.set(d, checkIntervalValidity(selectedTime, d));
    });
    return validationMap;
  }, [selectedTime, checkIntervalValidity]);

  const validStartTimes = useMemo(() => {
    const validationMap = new Map<number, { isValid: boolean, reason: string }>();
    const slots = [];
    if (!court) return validationMap;

    for (let t = openMin; t < closeMin; t += 60) slots.push(t);

    for (const time of slots) {
        const end = time + selectedDuration * 60;
        if (end > closeMin) {
            validationMap.set(time, { isValid: false, reason: `Booking would end after closing time (${closeTime})`});
            continue;
        }

        let isBlocked = false;
        for (const interval of blockedIntervals) {
             if (time < interval.end && end > interval.start) {
                validationMap.set(time, { isValid: false, reason: 'This time slot is already booked.' });
                isBlocked = true;
                break;
            }
        }
        if (!isBlocked) {
            validationMap.set(time, { isValid: true, reason: '' });
        }
    }
    return validationMap;
  }, [selectedDuration, openMin, closeMin, closeTime, blockedIntervals, court]);

  
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
  
  const handleTimeSelect = (time: number | null) => {
    if (time !== null) {
        setSelectedTime(time);
        // Check if current duration is valid for this new time
        const { isValid } = checkIntervalValidity(time, selectedDuration);
        if (!isValid) {
            // Find the longest possible valid duration
            let longestValid = 0;
            for (let d = availableDurations.length; d >= 1; d--) {
                const { isValid: isDurValid } = checkIntervalValidity(time, d);
                if (isDurValid) {
                    longestValid = d;
                    break;
                }
            }
            if (longestValid > 0) {
                 setSelectedDuration(longestValid);
                 toast({ title: 'Duration Adjusted', description: `Set to ${longestValid}hr to fit schedule.`});
            } else {
                 setSelectedTime(null); // This time is not bookable for any duration
                 toast({ variant: "destructive", title: 'No Available Slot', description: `This start time has no valid durations.`});
            }
        }
    } else {
      setAlternativesDialogOpen(true);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(startOfDay(date));
    setSelectedTime(null);
  };
  
  const handleDurationChange = (newDuration: number) => {
    setSelectedDuration(newDuration);
    if(selectedTime){
       const { isValid } = checkIntervalValidity(selectedTime, newDuration);
       if(!isValid){
           setSelectedTime(null);
           toast({ title: 'Please select a new time', description: `The previous start time is not valid for a ${newDuration}hr booking.`});
       }
    }
  };

  const handleBookNow = async () => {
    if (!court || selectedTime === null) return;
    
    const selectedTimeStr = format(addMinutes(startOfDay(selectedDate), selectedTime), 'HH:mm');
    setIsBooking(true);

    if (!user) {
      const pendingBooking = {
        courtId: court.id,
        dateKey: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTimeStr,
        durationHours: selectedDuration,
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
    const startTime = addMinutes(selectedDate, selectedTime);
    const endTime = add(startTime, { hours: selectedDuration });

    const bookingData = {
      id: bookingId,
      userId: user.uid,
      ownerId: court.ownerId,
      courtId: court.id,
      courtName: court.name,
      userName: user.displayName,
      userEmail: user.email,
      dateKey: format(selectedDate, 'yyyy-MM-dd'),
      startTime: selectedTimeStr,
      durationHours: selectedDuration,
      endTime: format(endTime, 'HH:mm'),
      totalPrice: (court.pricePerHour || 0) * selectedDuration,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
    };
    
    try {
      const playerBookingRef = doc(firestore, `users/${user.uid}/bookings`, bookingId);
      await setDoc(playerBookingRef, bookingData);
      
      const ownerBookingRef = doc(firestore, `users/${court.ownerId}/owner_bookings`, bookingId);
      await setDoc(ownerBookingRef, bookingData);
      
      // Note: This is an optimistic update and can cause race conditions.
      // A more robust solution would use a transaction or a Cloud Function
      // to ensure atomicity, but for this project, we proceed with this approach.
      const availabilityDocRef = doc(firestore, `courts/${court.id}/availability`, bookingData.dateKey);
      const availabilityDoc = await getDoc(availabilityDocRef);
      const newUnavailableTimes = [];
      for(let i=0; i < selectedDuration; i++) {
        const hour = parseInt(selectedTimeStr.split(':')[0]) + i;
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
            <DurationSelector
                selectedDuration={selectedDuration}
                onDurationChange={handleDurationChange}
                validDurations={validDurations}
            />
          </div>

          <div className="mt-6">
            <TimeGrid
              court={court}
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelect}
              validStartTimes={validStartTimes}
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
          searchTime={selectedTime !== null ? format(addMinutes(startOfDay(new Date()), selectedTime), 'HH:mm') : '12:00'}
        />
      )}
    </div>
  );
}


export default function CourtDetailsClient({ courtId }: { courtId: string }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <CourtDetailsContent courtId={courtId} />
    </Suspense>
  )
}
