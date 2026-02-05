
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;


// Use getSupabase() instead of a top-level constant to prevent execution during SSR
export const getSupabase = () => {
    if (supabaseClient) return supabaseClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
};



