
import { startOfDay, addHours, isWithinInterval, subHours } from 'date-fns';

/**
 * Montañita Night Logic: A "day" for events runs from 6:00 AM to 5:59 AM the next day.
 * This ensures that a party starting at 11 PM Friday is grouped with Friday events,
 * even if it ends at 4 AM Saturday.
 */

export const getMontanitaDayRange = (date: Date) => {
    // If it's before 6 AM, it belongs to the previous calendar day
    const start = addHours(startOfDay(date), 6);
    const end = addHours(start, 24);

    // If the check time is between 00:00 and 06:00, shift back one day
    if (date.getHours() < 6) {
        return {
            start: subHours(start, 24),
            end: start
        };
    }

    return { start, end };
};

export const isEventInMontanitaDay = (eventStart: Date, targetDay: Date) => {
    const { start, end } = getMontanitaDayRange(targetDay);
    return isWithinInterval(eventStart, { start, end });
};
