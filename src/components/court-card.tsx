'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Zap, Star } from 'lucide-react';
import type { Court, TimeSlot } from '@/lib/types';
import AlternativeCourtsDialog from './alternative-courts-dialog';

type CourtCardProps = {
  court: Court;
  searchDate: string;
};

export default function CourtCard({ court, searchDate }: CourtCardProps) {
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  
  // This component is not used in the new design. But keeping it to avoid breaking other things.
  // The functionality is now part of the parent card click.
  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    if (slot.available) {
      setIsBooking(true);
    } else {
      setShowAlternatives(true);
    }
  };

  const handleBookingConfirm = () => {
    toast({
      title: 'Booking Confirmed!',
      description: `You've booked ${court.name} on ${searchDate} at ${selectedSlot?.time}.`,
      className: 'bg-green-600 text-white border-green-600',
    });
    setIsBooking(false);
    setSelectedSlot(null);
  };
  
  const handleCardClick = () => {
    // For now, let's just log this. In a real app, this would navigate to a details page.
    console.log(`Card for ${court.name} clicked.`);
  }

  return (
    <Card className="overflow-hidden shadow-lg border-none rounded-2xl cursor-pointer" onClick={handleCardClick}>
      <CardContent className="p-0">
        <div className="relative h-60 w-full">
          <Image
            src={court.imageUrl}
            alt={court.name}
            fill
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={court.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-gray-800">
              {court.type}
            </Badge>
            {court.lighting && (
              <Badge className="bg-orange-400/80 text-white backdrop-blur-sm border-orange-400/80">
                <Zap className="h-3 w-3 mr-1" />
                LIGHTS
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3">
             <Badge variant="secondary" className="bg-gray-900/50 text-white backdrop-blur-sm flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">4.8</span>
              </Badge>
          </div>
           {court.price != null && (
            <div className="absolute bottom-3 right-3">
               <Badge variant="secondary" className="bg-white/90 text-gray-800 text-sm">
                FROM <span className="font-bold ml-1">₱{court.price}</span> /hr
              </Badge>
            </div>
           )}
        </div>
        <div className="p-4 bg-card">
          <CardTitle className="font-bold text-xl tracking-normal">{court.name}</CardTitle>
        </div>
      </CardContent>

      <AlertDialog open={isBooking} onOpenChange={setIsBooking}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Booking</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to book a slot at <strong>{court.name}</strong> on{' '}
              <strong>{searchDate}</strong> at <strong>{selectedSlot?.time}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBookingConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedSlot && (
        <AlternativeCourtsDialog
          open={showAlternatives}
          onOpenChange={setShowAlternatives}
          preferredCourt={court}
          searchDate={searchDate}
          searchTime={selectedSlot.time}
        />
      )}
    </Card>
  );
}
