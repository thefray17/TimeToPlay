export type Amenity = {
  name: string;
};

export type Court = {
  id: string;
  name: string;
  rating: number;
  pricePerHour?: number;
  tags: ('outdoor' | 'indoor' | 'lights')[];
  sport: 'Pickleball' | 'Basketball' | 'Tennis' | 'Badminton' | 'Volleyball' | 'Futsal';
  type: 'Indoor' | 'Outdoor';
  isLiveAvailable: boolean;
  imageUrl: string;
  imageHint: string;
  address: string;
  description: string;
  amenities: Amenity[];
  operatingHours: string;
  cost: 'Free' | 'Paid';
  surface: string;
  rules: string[];
  reviewsCount: number;
  lat: number;
  lng: number;
  sportTypes: string[];
  openTime: string;
  closeTime: string;
  heroImageUrl: string;
};

export type CourtAvailability = {
  [dateKey: string]: {
    unavailableTimes: string[];
  };
};
