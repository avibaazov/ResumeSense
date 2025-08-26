import { create } from "zustand";
import { supabase } from "./supabase";
import type { User, Session } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  const setError = (error: string) => {
    set({ error, isLoading: false });
  };

  const setLoading = (isLoading: boolean) => {
    set({ isLoading });
  };

  const updateAuthState = (session: Session | null, isInitializing = false) => {
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session?.user,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  };

  return {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isInitialized: false,
    error: null,

    signIn: async (email: string, password: string) => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        updateAuthState(data.session);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign in failed');
      }
    },

    signUp: async (email: string, password: string, username?: string) => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
            },
          },
        });

        if (error) throw error;
        
        // Note: User needs to confirm email before session is created
        updateAuthState(data.session);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign up failed');
      }
    },

    signOut: async () => {
      setLoading(true);
      
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        updateAuthState(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign out failed');
      }
    },

    resetPassword: async (email: string) => {
      setLoading(true);
      
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        
        set({ isLoading: false, error: null });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Password reset failed');
      }
    },

    clearError: () => {
      set({ error: null });
    },

    initialize: async () => {
      const { isInitialized } = get();
      if (isInitialized) return; // Prevent double initialization
      
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        updateAuthState(session, true);

        // Listen for auth changes (only set up once)
        supabase.auth.onAuthStateChange((_event, session) => {
          updateAuthState(session);
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Authentication initialization failed');
        set({ isInitialized: true }); // Mark as initialized even on error
      }
    },
  };
});

// Auth initialization is handled in root.tsx Layout component