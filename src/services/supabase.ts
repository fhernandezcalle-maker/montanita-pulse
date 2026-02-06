
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Business, MontanitaEvent, Sector } from '@/types';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = () => {
    if (supabaseClient) return supabaseClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
};

// Typed Helpers
export const supabaseApi = {
    async getSectors() {
        return getSupabase().from('sectors').select('*').order('name');
    },

    async getBusinessesBySector(sectorId: Sector | null) {
        let query = getSupabase().from('businesses').select('*');
        if (sectorId) {
            query = query.eq('sector_id', sectorId);
        }
        const { data, error } = await query.order('name');

        const mappedData = data?.map(b => ({
            ...b,
            location: {
                lat: b.location_lat,
                lng: b.location_lng
            }
        }));

        return { data: mappedData as Business[], error };
    },

    async getEvents(sectorId: Sector | null) {
        let query = getSupabase().from('events').select(`
            *,
            businesses (*)
        `);
        if (sectorId) {
            query = query.eq('sector_id', sectorId);
        }
        return query.order('start_at', { ascending: true });
    },

    async getEventsNear(lat: number, lng: number, radiusMeters: number = 2000) {
        return getSupabase().rpc('get_events_near', {
            user_lat: lat,
            user_lng: lng,
            radius_meters: radiusMeters
        });
    }
};
