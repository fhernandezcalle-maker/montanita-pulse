
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from '@/services/supabase';
import { User } from '@supabase/supabase-js';

type UserRole = 'visitor' | 'business' | 'admin';

interface UserProfile {
    id: string;
    role: UserRole;
    display_name: string | null;
    avatar_url: string | null;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    isBusiness: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
    isBusiness: false,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (data) {
            setProfile(data as UserProfile);
        } else {
            // If no profile exists, create one with default role
            // This handles users created before the profile system
            const role = user?.user_metadata?.role || 'visitor';
            const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0];

            const { data: newProfile } = await supabase
                .from('user_profiles')
                .upsert({
                    id: userId,
                    role,
                    display_name: displayName
                })
                .select()
                .single();

            if (newProfile) {
                setProfile(newProfile as UserProfile);
            }
        }
    };

    useEffect(() => {
        const supabase = getSupabase();

        // Check active session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await getSupabase().auth.signOut();
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    const isAdmin = profile?.role === 'admin';
    const isBusiness = profile?.role === 'business' || isAdmin;

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            isAdmin,
            isBusiness,
            signOut,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
