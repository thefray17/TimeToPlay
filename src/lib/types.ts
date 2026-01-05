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
};
