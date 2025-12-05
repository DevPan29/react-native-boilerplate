import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';

interface AuthState {
  // State
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Computed
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRole: UserRole | null;

  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial State
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  // Computed values (derived from state)
  get isAuthenticated() {
    return get().session !== null;
  },
  get isAdmin() {
    return get().profile?.role === 'admin';
  },
  get userRole() {
    return get().profile?.role ?? null;
  },

  // Actions
  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error.message);
        throw error;
      }

      if (session) {
        set({
          session,
          user: session.user,
        });

        // Fetch profile
        await get().refreshProfile();
      }

      // Set up auth state change listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);

        set({
          session,
          user: session?.user ?? null,
        });

        if (session) {
          await get().refreshProfile();
        } else {
          set({ profile: null });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        throw error;
      }

      set({ profile: data as Profile });
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error.message);
        throw error;
      }

      set({
        session: null,
        user: null,
        profile: null,
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Selector hooks for optimized re-renders
export const useSession = () => useAuthStore((state) => state.session);
export const useUser = () => useAuthStore((state) => state.user);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.session !== null);
export const useIsAdmin = () =>
  useAuthStore((state) => state.profile?.role === 'admin');
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useIsInitialized = () =>
  useAuthStore((state) => state.isInitialized);
