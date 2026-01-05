import type { Court } from './types';
import {
  ParkingCircle,
  Lamp,
  Users,
  Wifi,
  Wind,
  Droplets,
  CalendarDays,
  Basketball,
  Dumbbell,
} from 'lucide-react';

const generateTimeSlots = (startHour: number, endHour: number, unavailableTimes: string[] = []): { time: string; available: boolean }[] => {
  const slots = [];
  for (let i = startHour; i < endHour; i++) {
    const time = `${String(i).padStart(2, '0')}:00`;
    slots.push({
      time,
      available: !unavailableTimes.includes(time),
    });
  }
  return slots;
};

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayStr = formatDate(today);
const tomorrowStr = formatDate(tomorrow);

export const courts: Court[] = [
  {
    id: '1',
    name: 'Sunset Park Pickleball',
    address: '123 Court St, Sunnyville, CA',
    distance: 2.5,
    travelTime: 10,
    sport: 'Pickleball',
    type: 'Outdoor',
    cost: 'Paid',
    price: 15,
    surface: 'Asphalt',
    lighting: true,
    amenities: [
      { name: 'Parking', icon: ParkingCircle },
      { name: 'Lights', icon: Lamp },
      { name: 'Restrooms', icon: Droplets },
    ],
    rules: ['Non-marking shoes only.', 'Max 1-hour play if others are waiting.'],
    operatingHours: '8:00 AM - 10:00 PM',
    availability: {
      [todayStr]: generateTimeSlots(8, 22, ['14:00', '15:00', '18:00']),
      [tomorrowStr]: generateTimeSlots(8, 22, ['10:00', '11:00']),
    },
    imageUrl: 'https://picsum.photos/seed/pickle1/600/400',
    imageHint: 'pickleball court',
  },
  {
    id: '2',
    name: 'Downtown Hoops Center',
    address: '456 Center Ave, Metro City, NY',
    distance: 5.1,
    travelTime: 20,
    sport: 'Basketball',
    type: 'Indoor',
    cost: 'Paid',
    price: 25,
    surface: 'Hardwood',
    lighting: true,
    amenities: [
      { name: 'Locker Rooms', icon: Users },
      { name: 'Wi-Fi', icon: Wifi },
      { name: 'Scoreboard', icon: CalendarDays },
    ],
    rules: ['No food or drink on the court.', 'Bookings are for half-court.'],
    operatingHours: '6:00 AM - 11:00 PM',
    availability: {
      [todayStr]: generateTimeSlots(6, 23, ['18:00', '19:00', '20:00']),
      [tomorrowStr]: generateTimeSlots(6, 23, []),
    },
    imageUrl: 'https://picsum.photos/seed/basket2/600/400',
    imageHint: 'indoor basketball',
  },
  {
    id: '3',
    name: 'Greenwood Tennis Club',
    address: '789 Racquet Rd, Suburbia, TX',
    distance: 8.0,
    travelTime: 25,
    sport: 'Tennis',
    type: 'Outdoor',
    cost: 'Paid',
    price: 30,
    surface: 'Clay',
    lighting: true,
    amenities: [
      { name: 'Pro Shop', icon: Dumbbell },
      { name: 'Parking', icon: ParkingCircle },
      { name: 'Lights', icon: Lamp },
    ],
    rules: ['Proper tennis attire required.', 'Clay courts must be swept after use.'],
    operatingHours: '7:00 AM - 9:00 PM',
    availability: {
      [todayStr]: generateTimeSlots(7, 21, ['09:00', '14:00']),
      [tomorrowStr]: generateTimeSlots(7, 21, ['12:00']),
    },
    imageUrl: 'https://picsum.photos/seed/tennis1/600/400',
    imageHint: 'tennis court',
  },
  {
    id: '4',
    name: 'Community Rec Center',
    address: '101 Public Way, Everytown, USA',
    distance: 1.2,
    travelTime: 5,
    sport: 'Basketball',
    type: 'Outdoor',
    cost: 'Free',
    surface: 'Concrete',
    lighting: false,
    amenities: [{ name: 'Water Fountain', icon: Droplets }],
    rules: ['First-come, first-served.', 'Be respectful of other players.'],
    operatingHours: 'Sunrise to Sunset',
    availability: {
      [todayStr]: generateTimeSlots(7, 19, ['16:00', '17:00']),
      [tomorrowStr]: generateTimeSlots(7, 19, []),
    },
    imageUrl: 'https://picsum.photos/seed/basket1/600/400',
    imageHint: 'basketball court',
  },
  {
    id: '5',
    name: 'The Pickleball Dome',
    address: '222 Dome Dr, Climate City, WA',
    distance: 12.3,
    travelTime: 35,
    sport: 'Pickleball',
    type: 'Indoor',
    cost: 'Paid',
    price: 20,
    surface: 'Cushioned Acrylic',
    lighting: true,
    amenities: [
      { name: 'Climate Control', icon: Wind },
      { name: 'Locker Rooms', icon: Users },
      { name: 'Parking', icon: ParkingCircle },
    ],
    rules: ['Clean indoor shoes only.'],
    operatingHours: '24/7',
    availability: {
      [todayStr]: generateTimeSlots(0, 24, ['08:00', '19:00']),
      [tomorrowStr]: generateTimeSlots(0, 24, ['01:00', '02:00']),
    },
    imageUrl: 'https://picsum.photos/seed/pickle2/600/400',
    imageHint: 'indoor pickleball',
  },
  {
    id: '6',
    name: 'Grand Slam Tennis Arena',
    address: '333 Ace Ave, Champion City, FL',
    distance: 15,
    travelTime: 40,
    sport: 'Tennis',
    type: 'Outdoor',
    cost: 'Paid',
    price: 50,
    surface: 'Hard',
    lighting: true,
    amenities: [
      { name: 'Stadium Seating', icon: Users },
      { name: 'Pro Shop', icon: Dumbbell },
      { name: 'Lights', icon: Lamp },
    ],
    rules: ['Bookings must be cancelled 24 hours in advance.'],
    operatingHours: '6:00 AM - 12:00 AM',
    availability: {
      [todayStr]: generateTimeSlots(6, 24, ['18:00', '19:00']),
      [tomorrowStr]: generateTimeSlots(6, 24, ['20:00']),
    },
    imageUrl: 'https://picsum.photos/seed/tennis2/600/400',
    imageHint: 'tennis night',
  },
];
