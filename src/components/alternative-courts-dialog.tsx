'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  suggestAlternativeCourts,
  type SuggestAlternativeCourtsOutput,
} from '@/ai/flows/suggest-alternative-courts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Court } from '@/lib/types';
import { MapPin, Clock, ArrowRight, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AlternativeCourtsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferredCourt: Court;
  searchDate: string;
  searchTime: string;
};

export default function AlternativeCourtsDialog({
  open,
  onOpenChange,
  preferredCourt,
  searchDate,
  searchTime,
}: AlternativeCourtsDialogProps) {
  const [suggestions, setSuggestions] = useState<SuggestAlternativeCourtsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions(null);
        
        const courtDetailsString = `
          - Surface: ${preferredCourt.surface}
          - Amenities: ${preferredCourt.amenities.map(a => a.name).join(', ')}
          - Pricing: ${preferredCourt.cost === 'Paid' ? `₱${preferredCourt.pricePerHour}/hr` : 'Free'}
          - Rules: ${preferredCourt.rules.join('; ')}
          - Operating Hours: ${preferredCourt.operatingHours}
        `;

        try {
          const result = await suggestAlternativeCourts({
            sportType: preferredCourt.sport,
            dateTime: `${searchDate}T${searchTime}:00`,
            currentLocation: "37.7749,-122.4194", // Placeholder for actual user location (SF)
            distance: 15,
            indoorOutdoor: preferredCourt.type,
            freePaid: preferredCourt.cost,
            preferredCourtName: preferredCourt.name,
            preferredCourtDetails: courtDetailsString,
          });
          setSuggestions(result);
        } catch (e) {
          console.error("Failed to get AI suggestions:", e);
          setError("Sorry, we couldn't find alternatives at this time. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSuggestions();
    }
  }, [open, preferredCourt, searchDate, searchTime]);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Slot Unavailable</DialogTitle>
          <DialogDescription>
            {preferredCourt.name} is booked at {searchTime}. Here are some AI-powered suggestions nearby:
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-1 -m-1">
          {isLoading && <LoadingSkeleton />}
          {error && <p className="text-destructive text-center">{error}</p>}
          {suggestions && (
            <div className="space-y-3">
              {suggestions.alternativeCourts.map((altCourt, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{altCourt.courtName}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {altCourt.address}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <Badge variant="outline">{altCourt.distance} mi</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {altCourt.travelTime}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                           <DollarSign className="h-3 w-3" /> {altCourt.pricing}
                        </Badge>
                      </div>
                    </div>
                    <Button>
                      Book Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {suggestions.alternativeCourts.length === 0 && !isLoading && (
                  <p className="text-muted-foreground text-center py-8">No alternative courts found for this time slot.</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
