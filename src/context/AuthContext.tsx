
'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
    const isMounted = useRef(true);

    const fetchProfile = async (userId: string, userObj?: any) => {
        try {
            const supabase = getSupabase();
            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (!isMounted.current) return;

            let profileData = data;

            if (!profileData) {
                // If no profile exists, create one with default role
                const role = userObj?.user_metadata?.role || 'visitor';
                const displayName = userObj?.user_metadata?.display_name || userObj?.email?.split('@')[0];

                try {
                    const { data: newProfile } = await supabase
                        .from('user_profiles')
                        .upsert({
                            id: userId,
                            role,
                            display_name: displayName
                        })
                        .select()
                        .single();

                    if (!isMounted.current) return;
                    profileData = newProfile;
                } catch (e) {
                    console.log('Profile table may not exist yet');
                }
            }

            if (profileData && isMounted.current) {
                setProfile(profileData as UserProfile);

                // If business role, check if business exists - create if not
                if (profileData.role === 'business') {
                    try {
                        const { data: businesses } = await supabase
                            .from('businesses')
                            .select('id')
                            .eq('owner_id', userId)
                            .limit(1);

                        if (!isMounted.current) return;

                        if (!businesses || businesses.length === 0) {
                            // Create default business in the background
                            supabase
                                .from('businesses')
                                .insert({
                                    name: profileData.display_name || 'Mi Negocio',
                                    owner_id: userId,
                                    sector_id: 'centro',
                                    description: 'Descripción pendiente'
                                })
                                .then(() => {
                                    console.log('Business created successfully');
                                })
                                .catch((err) => {
                                    console.log('Business creation deferred');
                                });
                        }
                    } catch (e) {
                        console.log('Business check deferred');
                    }
                }
            }
        } catch (err: any) {
            // Ignore AbortError - this happens when component unmounts
            if (err?.name === 'AbortError' || err?.message?.includes('abort')) {
                console.log('Request aborted - this is normal during navigation');
                return;
            }
            console.error('Profile fetch error:', err);
        }
    };

    useEffect(() => {
        isMounted.current = true;
        const supabase = getSupabase();

        // Check active session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!isMounted.current) return;
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id, session.user);
            }
            if (isMounted.current) setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted.current) return;
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id, session.user);
            } else {
                setProfile(null);
            }
            if (isMounted.current) setLoading(false);
        });

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await getSupabase().auth.signOut();
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id, user);
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
