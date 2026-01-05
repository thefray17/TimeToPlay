'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { DollarSign, MapPin, CheckCircle, Clock } from 'lucide-react';
import type { Court, TimeSlot } from '@/lib/types';
import { SportIcons } from './icons';
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

  const timeSlots = court.availability[searchDate] || [];
  const SportIcon = SportIcons[court.sport];

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    if (slot.available) {
      setIsBooking(true);
    } else {
      setShowAlternatives(true);
    }
  };

  const handleBookingConfirm = () => {
    // Simulate booking
    toast({
      title: 'Booking Confirmed!',
      description: `You've booked ${court.name} on ${searchDate} at ${selectedSlot?.time}.`,
      action: <ToastAction altText="Close">Close</ToastAction>,
      className: 'bg-green-600 text-white border-green-600',
    });
    setIsBooking(false);
    setSelectedSlot(null);
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={court.imageUrl}
          alt={court.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={court.imageHint}
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant={court.type === 'Indoor' ? 'secondary' : 'default'} className="backdrop-blur-sm">
            {court.type}
          </Badge>
          <Badge variant={court.cost === 'Free' ? 'destructive' : 'secondary'} className="backdrop-blur-sm">
            {court.cost}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="font-headline tracking-tight">{court.name}</span>
          <SportIcon className="h-6 w-6 text-muted-foreground" />
        </CardTitle>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {court.distance} mi</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {court.travelTime} min travel</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <h4 className="font-semibold mb-2 text-sm">Available Slots</h4>
        {timeSlots.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={slot.available ? 'outline' : 'destructive'}
                size="sm"
                className={`text-xs h-8 ${!slot.available && 'line-through'}`}
                onClick={() => handleSlotClick(slot)}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center bg-muted py-4 rounded-md">No slots available for this day.</p>
        )}
        <Separator className="my-4" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {court.amenities.slice(0, 3).map((amenity) => (
              <TooltipProvider key={amenity.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <amenity.icon className="h-5 w-5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{amenity.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          {court.cost === 'Paid' && (
             <div className="flex items-center gap-1 font-semibold text-primary">
                <DollarSign className="h-4 w-4" />
                <span>{court.price}/hr</span>
             </div>
          )}
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
            <AlertDialogAction onClick={handleBookingConfirm} className="bg-primary hover:bg-accent">
              <CheckCircle className="mr-2 h-4 w-4" /> Confirm
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
