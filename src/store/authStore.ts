import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

// Store references for initialization - set by the stores themselves
let initializeDataStores: (() => Promise<void>) | null = null;
let resetDataStores: (() => void) | null = null;

export function setDataStoreCallbacks(
  init: () => Promise<void>,
  reset: () => void
) {
  initializeDataStores = init;
  resetDataStores = reset;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    });

    // Initialize data stores if user is logged in
    if (session?.user && initializeDataStores) {
      await initializeDataStores();
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const previousUser = useAuthStore.getState().user;
      set({
        session,
        user: session?.user ?? null,
      });

      if (session?.user && !previousUser) {
        // User logged in - load their data
        if (initializeDataStores) {
          await initializeDataStores();
        }
      } else if (!session?.user && previousUser) {
        // User logged out - reset stores
        if (resetDataStores) {
          resetDataStores();
        }
      }
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  },

  signOut: async () => {
    if (resetDataStores) {
      resetDataStores();
    }
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
