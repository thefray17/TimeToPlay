
import { startOfDay, parse } from 'date-fns';

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
 * Converts an array of hourly unavailable time strings into an array of minute-based intervals.
 * @param unavailableTimes An array of time strings like ["14:00", "16:00"]. Each represents the start of a 1-hour blocked slot.
 * @returns An array of objects, each with `start` and `end` minutes from midnight.
 */
export function getBlockedIntervals(unavailableTimes: string[]): { start: number; end: number }[] {
  return unavailableTimes.map(time => {
    const start = timeToMinutes(time);
    const end = start + 60; // Assuming all bookings are 1 hour for now
    return { start, end };
  });
}
