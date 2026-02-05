
import { RRule, rrulestr } from 'rrule';
import { MontanitaEvent } from '@/types';
import { addDays, startOfDay, endOfDay } from 'date-fns';

/**
 * Generates event instances from a recurring event within a date range.
 */
export function generateEventInstances(event: MontanitaEvent, start: Date, end: Date) {
    if (!event.is_recurring || !event.rrule) {
        return [event];
    }

    try {
        const rule = rrulestr(event.rrule);
        const occurrences = rule.between(start, end);

        const duration = event.end_at.getTime() - event.start_at.getTime();

        return occurrences.map((date, index) => ({
            ...event,
            id: `${event.id}-${index}`,
            start_at: date,
            end_at: new Date(date.getTime() + duration),
        }));
    } catch (error) {
        console.error('Error generating instances:', error);
        return [event];
    }
}

/**
 * Example RRule for "Every Tuesday and Thursday at 10 AM"
 * DTSTART:20260201T100000Z
 * RRULE:FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20261231T235959Z
 */
export function createWeeklyRRule(startDate: Date, days: string[]) {
    // days could be ['MO', 'WE']
    return new RRule({
        freq: RRule.WEEKLY,
        byweekday: days.map(d => (RRule as any)[d]),
        dtstart: startDate
    }).toString();
}
