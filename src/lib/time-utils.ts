
import { startOfDay, parse, addHours, format } from 'date-fns';

/**
 * Converts a time string (e.g., "14:30") to the number of minutes from the start of the day.
 * @param timeString The time string in "HH:mm" format.
 * @returns The number of minutes from midnight.
 */
export function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Generates an array of time slot strings for a given booking duration.
 * Example: ("17:00", 2) => ["17:00", "18:00"]
 * @param startTime The start time in "HH:mm" format.
 * @param durationHours The duration of the booking in hours.
 * @returns An array of "HH:mm" strings representing each 1-hour slot in the booking.
 */
export function getHourSlotsInRange(startTime: string, durationHours: number): string[] {
  const slots: string[] = [];
  const startDate = parse(startTime, 'HH:mm', new Date());

  for (let i = 0; i < durationHours; i++) {
    const slotDate = addHours(startDate, i);
    slots.push(format(slotDate, 'HH:mm'));
  }
  
  return slots;
}
