"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "patient" | "practitioner" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  onboardingCompleted: boolean;
}

interface UserContextValue {
  /** Supabase auth user (null if not authenticated) */
  authUser: SupabaseUser | null;
  /** App-level user profile from the users table (null if not loaded or not authenticated) */
  profile: UserProfile | null;
  /** Current user role shortcut */
  role: UserRole | null;
  /** Whether the initial load is still in progress */
  isLoading: boolean;
  /** Optimistically update the profile (e.g. after onboarding step) */
  setProfile: (updates: Partial<UserProfile>) => void;
  /** Re-fetch profile from DB */
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient();
  }, []);

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name, role, onboarding_completed")
        .eq("id", userId)
        .single();

      if (error || !data) {
        setProfileState(null);
        return;
      }

      setProfileState({
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role as UserRole,
        onboardingCompleted: data.onboarding_completed,
      });
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (authUser) {
      await fetchProfile(authUser.id);
    }
  }, [authUser, fetchProfile]);

  // Optimistic update helper
  const setProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfileState((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUser(user);
      if (user) {
        fetchProfile(user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        fetchProfile(user.id);
      } else {
        setProfileState(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const value = useMemo<UserContextValue>(
    () => ({
      authUser,
      profile,
      role: profile?.role ?? null,
      isLoading,
      setProfile,
      refreshProfile,
    }),
    [authUser, profile, isLoading, setProfile, refreshProfile]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
