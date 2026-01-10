'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface Profile {
    id: string;
    company_name: string;
    contact_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    is_admin: boolean;
    approved: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    // Fetch profile via API endpoint (works reliably with server-side auth)
    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
            } else {
                console.error('[AuthContext] Failed to fetch profile:', response.status);
                setProfile(null);
            }
        } catch (err) {
            console.error('[AuthContext] Error fetching profile:', err);
            setProfile(null);
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile();
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile();
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signUp = async (email: string, password: string, profileData: Partial<Profile>) => {
        // First, create the user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    company_name: profileData.company_name || '',
                    contact_name: profileData.contact_name || '',
                    phone: profileData.phone || '',
                    address: profileData.address || '',
                    city: profileData.city || '',
                    state: profileData.state || '',
                    zip: profileData.zip || '',
                },
            },
        });

        if (error) {
            return { error };
        }

        // If user was created, also update the profile table directly
        // This handles the case where the trigger creates an empty profile
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    company_name: profileData.company_name || '',
                    contact_name: profileData.contact_name || '',
                    phone: profileData.phone || '',
                    address: profileData.address || '',
                    city: profileData.city || '',
                    state: profileData.state || '',
                    zip: profileData.zip || '',
                })
                .eq('id', data.user.id);

            if (profileError) {
                console.error('Error updating profile after signup:', profileError);
                // Don't return error here - account was created successfully
            }
        }

        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                signIn,
                signUp,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}