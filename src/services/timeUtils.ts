
import { addHours, subHours, startOfDay, endOfDay } from 'date-fns';

/**
 * Returns the "Pulse Day" range for a given date.
 * A Pulse Day runs from 6:00 AM to 5:59 AM the next day.
 */
export function getPulseDayRange(date: Date = new Date()) {
    // If current time is between 00:00 and 06:00, we are still in "yesterday's" Pulse Day.
    const hour = date.getHours();
    let baseDate = date;

    if (hour < 6) {
        baseDate = subHours(date, 6);
    }

    const start = addHours(startOfDay(baseDate), 6);
    const end = addHours(endOfDay(baseDate), 6);

    return { start, end };
}

/**
 * Checks if an event falls within the current Pulse Day.
 */
export function isEventInCurrentPulseDay(eventStart: Date, eventEnd: Date) {
    const { start, end } = getPulseDayRange();
    return (eventStart >= start && eventStart <= end) || (eventEnd >= start && eventEnd <= end);
}
