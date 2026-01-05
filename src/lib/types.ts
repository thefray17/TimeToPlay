import type { LucideIcon } from 'lucide-react';

export type Amenity = {
  name: string;
  icon: LucideIcon;
};

export type TimeSlot = {
  time: string; // e.g., "09:00"
  available: boolean;
};

export type Court = {
  id: string;
  name: string;
  address: string;
  distance: number; // in miles
  travelTime: number; // in minutes
  sport: 'Pickleball' | 'Basketball' | 'Tennis';
  type: 'Indoor' | 'Outdoor';
  cost: 'Free' | 'Paid';
  price?: number; // per hour
  surface: string;
  lighting: boolean;
  amenities: Amenity[];
  rules: string[];
  operatingHours: string;
  availability: { [date: string]: TimeSlot[] }; // date as "yyyy-MM-dd"
  imageUrl: string;
  imageHint: string;
};
