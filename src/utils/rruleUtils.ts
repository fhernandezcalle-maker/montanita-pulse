
/**
 * RRule Utilities for Montañita Pulse
 * Handles recurring events like yoga classes, surf lessons, etc.
 * 
 * Note: Uses simple string-based RRule generation to avoid complex dependencies
 */

export interface RecurringEventInput {
    frequency: 'daily' | 'weekly' | 'monthly' | 'none';
    daysOfWeek?: number[]; // 0=Sunday, 6=Saturday
    until?: Date;
}

/**
 * Generate RRule string from event input (RFC 5545 format)
 */
export const generateRRule = (input: RecurringEventInput): string | null => {
    if (input.frequency === 'none') return null;

    const freqMap = {
        daily: 'DAILY',
        weekly: 'WEEKLY',
        monthly: 'MONTHLY'
    };

    let rrule = `FREQ=${freqMap[input.frequency]}`;

    // Add until date (default 90 days)
    const until = input.until || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const untilStr = until.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    rrule += `;UNTIL=${untilStr}`;

    // Add days of week for weekly recurrence
    if (input.frequency === 'weekly' && input.daysOfWeek?.length) {
        const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const byDay = input.daysOfWeek.map(d => dayNames[d]).join(',');
        rrule += `;BYDAY=${byDay}`;
    }

    return rrule;
};

/**
 * Parse frequency string to RRule input
 */
export const frequencyToRRule = (freq: string): string | null => {
    switch (freq) {
        case 'Diario':
            return generateRRule({ frequency: 'daily' });
        case 'Semanal':
            return generateRRule({ frequency: 'weekly' });
        case 'Mensual':
            return generateRRule({ frequency: 'monthly' });
        default:
            return null;
    }
};

/**
 * Get human-readable description of recurrence
 */
export const getRecurrenceDescription = (rrule: string | null): string => {
    if (!rrule) return 'Una sola vez';

    if (rrule.includes('FREQ=DAILY')) return 'Todos los días';
    if (rrule.includes('FREQ=WEEKLY')) return 'Cada semana';
    if (rrule.includes('FREQ=MONTHLY')) return 'Cada mes';

    return 'Evento recurrente';
};

/**
 * Common presets for Montañita events
 */
export const RRULE_PRESETS = {
    DAILY_YOGA: 'FREQ=DAILY;UNTIL=20270101T000000Z',
    WEEKDAY_SURF: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20270101T000000Z',
    WEEKEND_PARTY: 'FREQ=WEEKLY;BYDAY=FR,SA;UNTIL=20270101T000000Z'
};
