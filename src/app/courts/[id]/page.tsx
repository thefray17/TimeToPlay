'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { add, format } from 'date-fns';
import AlternativeCourtsDialog from '@/components/alternative-courts-dialog';
import type { Court } from '@/lib/types';
import { courts } from '@/lib/data';

// --- MOCK DATA ---
const courtDetails = {
  id: '1',
  name: 'Sunset Pickleball Club',
  sport: 'Pickleball',
  address: '1234 Sunset Blvd, San Francisco',
  rating: 4.8,
  reviewsCount: 124,
  pricePerHour: 500,
  openTime: '06:00',
  closeTime: '22:00',
  description:
    'Premier outdoor pickleball facility with 8 championship courts. Evening play available under LED lights.',
  amenities: ['PRO SHOP', 'LOCKER ROOM', 'CAFE', 'OUTDOOR', 'HARD COURT'],
  heroImageUrl: 'https://picsum.photos/seed/pickle-detail/1200/400',
  imageHint: 'pickleball court sunset',
  type: 'Outdoor',
  cost: 'Paid',
  surface: 'Hard Court',
  rules: ['No food or drinks on court.'],
  isLiveAvailable: true,
  tags: ['outdoor', 'lights'],
  operatingHours: '6:00 AM - 10:00 PM',
};

const courtAvailability = {
  '2026-01-05': {
    unavailableTimes: ['14:00', '16:00', '21:00'],
  },
  '2026-01-06': {
    unavailableTimes: ['09:00', '10:00', '15:00', '18:00'],
  },
  '2026-01-07': {
    unavailableTimes: ['08:00', '11:00', '12:00', '13:00', '17:00'],
  },
};

const availableTimeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

// --- REUSABLE SUBCOMPONENTS ---

const HeroHeader = ({ imageUrl, imageHint }: { imageUrl: string; imageHint: string }) => {
  const router = useRouter();
  return (
    <div className="relative h-64 md:h-80 w-full">
      <Image
        src={imageUrl}
        alt={courtDetails.name}
        fill
        style={{ objectFit: 'cover' }}
        className="bg-gray-200"
        data-ai-hint={imageHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute top-4 left-4">
        <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

const CourtMetaRow = () => (
  <div className="flex justify-between items-start -mt-12 relative z-10 px-4 md:px-0">
    <div>
      <Badge className="mb-2">{courtDetails.sport}</Badge>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{courtDetails.name}</h1>
      <div className="flex items-center text-muted-foreground mt-2">
        <MapPin className="h-4 w-4 mr-1.5" />
        <span>{courtDetails.address}</span>
      </div>
    </div>
    <div className="text-right flex-shrink-0 ml-4">
      <div className="flex items-center justify-end gap-1">
        <p className="text-xl font-bold">{courtDetails.rating}</p>
        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
      </div>
      <p className="text-sm text-muted-foreground">{courtDetails.reviewsCount} reviews</p>
    </div>
  </div>
);

const InfoCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
          <DollarSign className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground tracking-wider">PRICE</p>
          <p className="text-lg font-semibold">₱{courtDetails.pricePerHour}/hr</p>
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
          <p className="text-lg font-semibold">{courtDetails.openTime} – {courtDetails.closeTime}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AmenityChips = () => (
  <div className="flex flex-wrap gap-2 mt-4">
    {courtDetails.amenities.map((amenity) => (
      <Badge key={amenity} variant="outline" className="text-sm py-1 px-3">
        {amenity}
      </Badge>
    ))}
  </div>
);

const DaySelector = ({ selectedDate, onDateChange }: { selectedDate: Date, onDateChange: (date: Date) => void }) => {
  const days = [0, 1, 2].map(i => add(new Date('2026-01-05T00:00:00'), { days: i }));
  
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
      <Button variant="outline" className="flex flex-col h-auto px-4 py-2 rounded-lg border-dashed">
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


const TimeGrid = ({ selectedDate, duration, selectedTime, onTimeSelect }: { selectedDate: Date; duration: number, selectedTime: string | null, onTimeSelect: (time: string | null) => void }) => {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const dailyAvailability = courtAvailability[dateKey as keyof typeof courtAvailability] || { unavailableTimes: [] };

  const isSlotAvailable = useCallback((time: string) => {
    const startHour = parseInt(time.split(':')[0], 10);
    for (let i = 0; i < duration; i++) {
      const checkHour = startHour + i;
      const checkTime = `${String(checkHour).padStart(2, '0')}:00`;
      if (dailyAvailability.unavailableTimes.includes(checkTime) || checkHour >= parseInt(courtDetails.closeTime.split(':')[0], 10)) {
        return false;
      }
    }
    return true;
  }, [duration, dailyAvailability.unavailableTimes]);
  
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

const StickyActionBar = ({ isEnabled, onBook, onShowMap }: { isEnabled: boolean; onBook: () => void; onShowMap: () => void; }) => (
  <div className="sticky bottom-0 left-0 right-0 w-full bg-background/80 backdrop-blur-sm border-t py-3 pb-safe z-20">
    <div className="container max-w-5xl mx-auto flex items-center justify-between gap-4">
      <Button variant="outline" className="h-12 w-auto px-6" onClick={onShowMap}>
        <Navigation className="h-5 w-5 mr-2" /> Maps
      </Button>
      <Button className="h-12 flex-1" disabled={!isEnabled} onClick={onBook}>
        Book Now
      </Button>
    </div>
  </div>
);


const BookingConfirmationModal = ({ open, onOpenChange, time, date, duration }: { open: boolean, onOpenChange: (open: boolean) => void, time: string, date: Date, duration: number }) => {
  if (!time) return null;

  const startTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);
  const endTime = add(startTime, { hours: duration });
  const totalPrice = courtDetails.pricePerHour * duration;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Booking Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to book a court. Please review the details below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 text-sm">
          <p><strong>Court:</strong> {courtDetails.name}</p>
          <p><strong>Date:</strong> {format(date, 'EEEE, MMMM d, yyyy')}</p>
          <p><strong>Time:</strong> {format(startTime, 'p')} - {format(endTime, 'p')} ({duration} {duration > 1 ? 'hours' : 'hour'})</p>
          <p className="text-lg font-bold"><strong>Total Price:</strong> ₱{totalPrice}</p>
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <AlertDialogAction onClick={() => onOpenChange(false)}>Confirm Booking</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function CourtDetailsPage({ params }: { params: { id: string } }) {
  const [selectedDate, setSelectedDate] = useState(new Date('2026-01-05T00:00:00'));
  const [duration, setDuration] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlternativesDialogOpen, setAlternativesDialogOpen] = useState(false);

  const handleTimeSelect = (time: string | null) => {
    if (time) {
      setSelectedTime(time);
    } else {
      setAlternativesDialogOpen(true);
    }
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    setSelectedTime(null); // Reset time when duration changes
  }

  const isBookingEnabled = selectedTime !== null;
  
  const formattedDateLabel = useMemo(() => {
    return format(selectedDate, 'MMM d, yyyy').toUpperCase();
  }, [selectedDate]);

  return (
    <div className="bg-background min-h-screen">
      <HeroHeader imageUrl={courtDetails.heroImageUrl} imageHint={courtDetails.imageHint} />

      <main className="container max-w-5xl mx-auto px-4 pb-32">
        <CourtMetaRow />
        <InfoCards />
        <Separator className="my-8" />
        <div className="px-4 md:px-0">
          <h2 className="text-xl font-bold tracking-tight">About</h2>
          <p className="mt-2 text-muted-foreground">{courtDetails.description}</p>
          <AmenityChips />
        </div>
        <Separator className="my-8" />

        {/* Availability Section */}
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
            />
          </div>
        </div>
      </main>

      <StickyActionBar 
        isEnabled={isBookingEnabled}
        onBook={() => setIsModalOpen(true)}
        onShowMap={() => alert("Show map feature coming soon!")}
      />
      
      {selectedTime && (
         <BookingConfirmationModal 
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            time={selectedTime}
            date={selectedDate}
            duration={duration}
         />
      )}
      
      <AlternativeCourtsDialog
        open={isAlternativesDialogOpen}
        onOpenChange={setAlternativesDialogOpen}
        preferredCourt={courtDetails as Court}
        searchDate={format(selectedDate, 'yyyy-MM-dd')}
        searchTime={selectedTime || '12:00'}
      />
    </div>
  );
}
